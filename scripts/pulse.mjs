#!/usr/bin/env node
// "Did the world respond?" — celebrate real engagement on a project.
// Pulls the CUSTOM events you defined (tournament_viewed, subscribe_form_
// submitted, …) from PostHog and frames them as wins: best day, what's new,
// the trend since launch. Read-only — writes nothing, deploys nothing.
//
//   npm run pulse -- PickleRadar        # last 14 days (default)
//   npm run pulse -- PickleRadar 30     # last 30 days
//   tinyship pulse PickleRadar          # same, from anywhere
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
const wantName = args.find((a) => !/^\d+$/.test(a));
const days = Number(args.find((a) => /^\d+$/.test(a))) || 14;

if (!wantName) {
  console.error('Usage: tinyship pulse <Project> [days]   e.g. tinyship pulse PickleRadar 30');
  process.exit(1);
}

// --- resolve the project's posthogId from lib/site.ts ---
const src = readFileSync(sitePath, "utf8");
const pStart = src.indexOf("export const projects");
const pBlock = src.slice(pStart, src.indexOf("\n];", pStart));
let phId = null;
let projName = wantName;
for (const obj of pBlock.match(/\{[\s\S]*?\}/g) || []) {
  const name = (obj.match(/name:\s*"([^"]+)"/) || [])[1];
  const id = (obj.match(/posthogId:\s*"([^"]+)"/) || [])[1];
  if (name && name.toLowerCase() === wantName.toLowerCase()) {
    phId = id;
    projName = name;
    break;
  }
}
if (!phId) {
  console.error(`"${wantName}" has no posthogId in lib/site.ts (or isn't a project). Add one to celebrate its pulse.`);
  process.exit(1);
}

// HogQL: count each custom (non-$) event per day in the window. The posthogId
// already scopes us to this project, so no host filter is needed — custom
// events only fire in production anyway.
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
if (!res.ok) {
  console.error(`PostHog ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
const data = await res.json();
const rows = data.results || []; // [event, dayISO, count]

if (rows.length === 0) {
  console.log(`\n🌱  ${projName}: no custom events in the last ${days} days yet. Ship something people can do.\n`);
  process.exit(0);
}

// Aggregate per event: total, best day (+count), most recent active day.
const byEvent = new Map();
for (const [event, day, c] of rows) {
  const e = byEvent.get(event) || { total: 0, best: { day: null, c: 0 }, last: null };
  e.total += c;
  if (c > e.best.c) e.best = { day, c };
  if (!e.last || day > e.last) e.last = day;
  byEvent.set(event, e);
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

const sorted = [...byEvent.entries()].sort((a, b) => b[1].total - a[1].total);
const grandTotal = sorted.reduce((s, [, e]) => s + e.total, 0);

console.log(`\n🎉  ${projName} — the world responded (last ${days} days)\n`);
console.log(`    ${grandTotal} real interactions across ${sorted.length} event${sorted.length === 1 ? "" : "s"}\n`);
for (const [event, e] of sorted) {
  const bestStr = e.best.day ? `  ·  best day ${e.best.c} on ${fmtDay(e.best.day)}` : "";
  const lastStr = e.last ? `  ·  last ${fmtDay(e.last)}` : "";
  console.log(`    ${String(e.total).padStart(4)}  ${label(event).padEnd(22)}${bestStr}${lastStr}`);
}
console.log(`\n💡  Log a win to the wall:  tinyship "PickleRadar hit 38 tournament views in a day" --project=${projName}\n`);
