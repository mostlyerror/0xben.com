#!/usr/bin/env node
// Pull weekly unique visitors from PostHog for every project that has a
// `posthogId`, and write the numbers into each project's `traffic` array
// in lib/site.ts (which renders the card sparkline). Read-only against your
// code except for those arrays.
//
//   npm run traffic            # last 8 weeks
//   npm run traffic -- 12      # last 12 weeks
//   npm run traffic -- --dry   # show what it found, write nothing
//
// Requires in .env:  POSTHOG_API_KEY=phx_...   (personal API key, read scope)
// Optional in .env:  POSTHOG_HOST=https://us.posthog.com   (or eu., or self-host)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");

// --- load .env (simple parse, no dep) ---
const env = {};
try {
  for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const KEY = env.POSTHOG_API_KEY || process.env.POSTHOG_API_KEY;
const HOST = (env.POSTHOG_HOST || process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/$/, "");

if (!KEY) {
  console.error("Missing POSTHOG_API_KEY in .env (a personal API key with read scope).");
  process.exit(1);
}

const args = process.argv.slice(2);
const weeks = Number(args.find((a) => /^\d+$/.test(a))) || 8;
const dry = args.includes("--dry");

// --- find projects with a posthogId in lib/site.ts ---
const src = readFileSync(sitePath, "utf8");
const pStart = src.indexOf("export const projects");
const pBlock = src.slice(pStart, src.indexOf("\n];", pStart));
const targets = [];
for (const obj of pBlock.match(/\{[\s\S]*?\}/g) || []) {
  const name = (obj.match(/name:\s*"([^"]+)"/) || [])[1];
  const phId = (obj.match(/posthogId:\s*"([^"]+)"/) || [])[1];
  const href = (obj.match(/href:\s*"([^"]+)"/) || [])[1];
  // Production host from the project's href, so we only count REAL traffic
  // (not localhost dev sessions or *.vercel.app preview deploys = you).
  const host = href ? href.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;
  if (name && phId) targets.push({ name, phId, host });
}

if (targets.length === 0) {
  console.error("No projects have a `posthogId` in lib/site.ts. Add one to a project and retry.");
  process.exit(1);
}

// HogQL: weekly unique visitors on the production host only.
function buildQuery(host) {
  const hostFilter = host
    ? `AND properties.$host = '${host}'`
    : `AND properties.$host NOT LIKE '%localhost%' AND properties.$host NOT LIKE '%vercel.app%'`;
  return `
    SELECT toStartOfWeek(timestamp) AS week, count(DISTINCT person_id) AS visitors
    FROM events
    WHERE event = '$pageview' ${hostFilter} AND timestamp > now() - INTERVAL ${weeks} WEEK
    GROUP BY week ORDER BY week ASC
  `;
}

async function fetchWeekly(projectId, host) {
  const res = await fetch(`${HOST}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query: buildQuery(host) } }),
  });
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  // results: [[weekStart, visitors], ...]
  return (data.results || []).map((r) => Number(r[1]));
}

console.log(`\n📈  Pulling weekly visitors (last ${weeks} weeks) for ${targets.length} project(s)…\n`);
let updated = src;
let any = false;
for (const t of targets) {
  try {
    const series = await fetchWeekly(t.phId, t.host);
    if (series.length === 0) {
      console.log(`  ${t.name.padEnd(16)} no pageview data in window`);
      continue;
    }
    const latest = series[series.length - 1];
    console.log(`  ${t.name.padEnd(16)} [${series.join(", ")}]  (latest ${latest})`);
    any = true;
    if (!dry) {
      // Replace this project's traffic: [...] (or insert after its posthogId line)
      const arr = `[${series.join(", ")}]`;
      const objRe = new RegExp(`(name:\\s*"${t.name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"[\\s\\S]*?)(\\n\\s*\\})`);
      updated = updated.replace(objRe, (whole, body, close) => {
        if (/traffic:\s*\[[^\]]*\]/.test(body)) {
          return body.replace(/traffic:\s*\[[^\]]*\]/, `traffic: ${arr}`) + close;
        }
        return `${body}\n    traffic: ${arr},${close}`;
      });
    }
  } catch (e) {
    console.log(`  ${t.name.padEnd(16)} ⚠️  ${e.message}`);
  }
}

if (dry) {
  console.log("\n(--dry — wrote nothing)\n");
  process.exit(0);
}
if (!any) {
  console.log("\nNothing to write.\n");
  process.exit(0);
}

writeFileSync(sitePath, updated);
console.log("\n✅  Wrote traffic arrays to lib/site.ts. Commit & deploy to publish:\n   git add lib/site.ts && git commit -m \"traffic: refresh sparklines\" && git push && vercel deploy --prod --yes\n");
