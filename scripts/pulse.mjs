#!/usr/bin/env node
// "Did the world respond?" — celebrate real engagement across your projects.
// Pulls the CUSTOM events you defined (tournament_viewed, subscribe_form_
// submitted, …) from PostHog and frames them as wins. Read-only.
//
//   tinyship pulse                  # PORTFOLIO: every project, highlights rolled up
//   tinyship pulse 30               # portfolio, last 30 days
//   tinyship pulse PickleRadar      # one project, full detail
//   tinyship pulse PickleRadar 30   # one project, last 30 days
//
// Uses the PostHog REST API directly (POSTHOG_API_KEY in .env) — NOT the MCP,
// so it works standalone. Sibling of scripts/traffic.mjs.

import { readFileSync } from "node:fs";
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
const wantName = args.find((a) => !/^\d+$/.test(a)); // undefined → portfolio mode
const days = Number(args.find((a) => /^\d+$/.test(a))) || 14;

// --- read every project + its posthogId from lib/site.ts ---
const src = readFileSync(sitePath, "utf8");
const pBlock = src.slice(src.indexOf("export const projects"), src.indexOf("\n];", src.indexOf("export const projects")));
const allProjects = [];
for (const obj of pBlock.match(/\{[\s\S]*?\}/g) || []) {
  const name = (obj.match(/name:\s*"([^"]+)"/) || [])[1];
  const id = (obj.match(/posthogId:\s*"([^"]+)"/) || [])[1];
  if (name && id) allProjects.push({ name, phId: id });
}

// Friendlier labels for known events; fall back to the raw name humanized.
const LABELS = {
  tournament_viewed: "tournament views",
  register_button_clicked: "register clicks",
  share_clicked: "shares",
  subscribe_form_submitted: "subscribers",
  tournament_issue_reported: "issue reports",
  tournament_submitted: "tournaments submitted",
};
const label = (ev) => LABELS[ev] || ev.replace(/_/g, " ");
const fmtDay = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Pull custom-event activity for one project. Returns { byEvent, total } or
// throws on an API error so the caller can decide how loud to be about it.
async function fetchPulse(phId) {
  // The posthogId already scopes us to this project, so no host filter is
  // needed — custom events only fire in production anyway.
  const query = `
    SELECT event, toDate(timestamp) AS day, count() AS c
    FROM events
    WHERE event NOT LIKE '$%' AND timestamp > now() - INTERVAL ${days} DAY
    GROUP BY event, day
    ORDER BY day ASC
  `;
  const res = await fetch(`${HOST}/api/projects/${phId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const rows = (await res.json()).results || []; // [event, dayISO, count]

  const byEvent = new Map();
  for (const [event, day, c] of rows) {
    const e = byEvent.get(event) || { total: 0, best: { day: null, c: 0 }, last: null };
    e.total += c;
    if (c > e.best.c) e.best = { day, c };
    if (!e.last || day > e.last) e.last = day;
    byEvent.set(event, e);
  }
  const total = [...byEvent.values()].reduce((s, e) => s + e.total, 0);
  return { byEvent, total };
}

// ── Single-project detail view ──────────────────────────────────────────────
async function showOne({ name, phId }) {
  const { byEvent, total } = await fetchPulse(phId);
  if (total === 0) {
    console.log(`\n🌱  ${name}: no custom events in the last ${days} days yet. Ship something people can do.\n`);
    return;
  }
  const sorted = [...byEvent.entries()].sort((a, b) => b[1].total - a[1].total);
  console.log(`\n🎉  ${name} — the world responded (last ${days} days)\n`);
  console.log(`    ${total} real interactions across ${sorted.length} event${sorted.length === 1 ? "" : "s"}\n`);
  for (const [event, e] of sorted) {
    const bestStr = e.best.day ? `  ·  best day ${e.best.c} on ${fmtDay(e.best.day)}` : "";
    const lastStr = e.last ? `  ·  last ${fmtDay(e.last)}` : "";
    console.log(`    ${String(e.total).padStart(4)}  ${label(event).padEnd(22)}${bestStr}${lastStr}`);
  }
  console.log(`\n💡  Log a win to the wall:  tinyship "..." --project=${name}\n`);
}

// ── Portfolio view: every project, highlights rolled up ─────────────────────
async function showPortfolio() {
  if (allProjects.length === 0) {
    console.error("No projects have a posthogId in lib/site.ts. Add one to pulse-check it.");
    process.exit(1);
  }

  // Fetch all projects in parallel; keep failures from sinking the whole digest.
  const results = await Promise.all(
    allProjects.map(async (p) => {
      try {
        return { ...p, ...(await fetchPulse(p.phId)) };
      } catch (e) {
        return { ...p, error: e.message };
      }
    }),
  );

  // Each project's standout: its single biggest event in the window.
  const withTop = results.map((r) => {
    if (r.error || !r.byEvent || r.total === 0) return r;
    const [topEvent, top] = [...r.byEvent.entries()].sort((a, b) => b[1].total - a[1].total)[0];
    return { ...r, topEvent, top };
  });

  const active = withTop.filter((r) => !r.error && r.total > 0).sort((a, b) => b.total - a.total);
  const quiet = withTop.filter((r) => !r.error && r.total === 0);
  const errored = withTop.filter((r) => r.error);
  const grand = active.reduce((s, r) => s + r.total, 0);

  console.log(`\n🎉  The world responded — your portfolio (last ${days} days)\n`);
  console.log(`    ${grand} real interactions across ${active.length} live project${active.length === 1 ? "" : "s"}\n`);

  const pad = Math.max(...allProjects.map((p) => p.name.length));
  for (const r of active) {
    const topStr = `${r.top.total} ${label(r.topEvent)}${r.top.best.day ? ` (best ${r.top.best.c} on ${fmtDay(r.top.best.day)})` : ""}`;
    console.log(`    ${r.name.padEnd(pad)}  ${String(r.total).padStart(4)} interactions  ·  top: ${topStr}`);
  }
  for (const r of quiet) {
    console.log(`    ${r.name.padEnd(pad)}     — quiet (no events yet)`);
  }
  for (const r of errored) {
    console.log(`    ${r.name.padEnd(pad)}     ⚠️  ${r.error}`);
  }

  // Headline: the single most active project's standout moment.
  if (active.length > 0) {
    const h = active[0];
    const when = h.top.best.day ? ` on ${fmtDay(h.top.best.day)}` : "";
    console.log(`\n🏆  Headline: ${h.name}'s best day was ${h.top.best.c} ${label(h.topEvent)}${when}.`);
    console.log(`\n💡  Dig into one:  tinyship pulse ${h.name}\n`);
  } else {
    console.log(`\n🌱  Quiet across the board this window. Go give the world something to respond to.\n`);
  }
}

// ── Route ───────────────────────────────────────────────────────────────────
if (!wantName) {
  await showPortfolio();
} else {
  const proj = allProjects.find((p) => p.name.toLowerCase() === wantName.toLowerCase());
  if (!proj) {
    console.error(`"${wantName}" has no posthogId in lib/site.ts (or isn't a project).`);
    if (allProjects.length) console.error(`\nProjects with a pulse:\n  ` + allProjects.map((p) => p.name).join("\n  "));
    process.exit(1);
  }
  await showOne(proj);
}
