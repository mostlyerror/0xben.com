#!/usr/bin/env node
// Log a ship in one command. Prepends a dated entry to the `shipped`
// array in lib/site.ts, commits, and pushes (Vercel's GitHub integration
// then builds & deploys automatically).
//
//   npm run ship -- "What you shipped" [https://link]
//   npm run ship -- "Wrote a post about X" https://…
//   npm run ship -- "test" --dry        # preview only, writes nothing
//
// The point is zero friction: the easier this is, the more you'll log,
// the more momentum you keep.

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [what, href] = args.filter((a) => !a.startsWith("--"));
const tagArg = args.find((a) => a.startsWith("--tag="));
const tag = tagArg ? tagArg.slice("--tag=".length) : undefined;
const projArg = args.find((a) => a.startsWith("--project="));
const project = projArg ? projArg.slice("--project=".length) : undefined;

if (!what) {
  console.error('Usage: npm run ship -- "What you shipped" [https://link] [--tag=post] [--project=Name] [--dry]');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");
const src = readFileSync(sitePath, "utf8");

const MARKER = "// ship:insert";
if (!src.includes(MARKER)) {
  console.error(`Couldn't find "${MARKER}" in lib/site.ts — is the shipped array intact?`);
  process.exit(1);
}

const date = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const entry =
  `  { date: ${JSON.stringify(date)}, what: ${JSON.stringify(what)}` +
  (href ? `, href: ${JSON.stringify(href)}` : "") +
  (tag ? `, tag: ${JSON.stringify(tag)}` : "") +
  (project ? `, project: ${JSON.stringify(project)}` : "") +
  ` },`;

console.log("\n📦  New ship:\n" + entry + "\n");

if (flags.has("--dry")) {
  console.log("(--dry — nothing written)");
  process.exit(0);
}

// Insert directly after the marker line → keeps the ledger newest-first.
// Use a replacement FUNCTION (not a string) so `$` in the ship text (e.g.
// "$1.6M") is never interpreted as a regex backreference and corrupts the file.
const updated = src.replace(new RegExp(`(.*${MARKER}.*\\n)`), (m) => `${m}${entry}\n`);
writeFileSync(sitePath, updated);
console.log("✅  Added to lib/site.ts");

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });

try {
  run("git add lib/site.ts");
  run(`git commit -m ${JSON.stringify(`Ship: ${what}`)}`);
  console.log("✅  Committed");
} catch {
  console.error("⚠️  Commit skipped/failed — the file is updated; commit it manually.");
}

try {
  run("git push");
  console.log("\n🚀  Pushed. Vercel's GitHub integration will build & deploy it.");
} catch {
  console.error("⚠️  Push skipped (offline or no upstream) — committed locally, push when ready.");
}

// Dual-write to growthdeck (distribution C2) — fire-and-forget; a growthdeck
// outage must never make a ship fail.
try {
  const env = readFileSync(join(root, ".env"), "utf8");
  const token = (env.match(/^GROWTHDECK_INGEST_TOKEN=(.*)$/m) || [])[1]?.trim();
  if (token) {
    const slug = (project || "mostly-error").toLowerCase().trim().replace(/^@/, "").replace(/\s+/g, "-");
    const channel = !href
      ? "blog" // no link → the 0xben.com ledger itself is the surface
      : /x\.com|twitter\.com/.test(href) ? "x"
      : /producthunt\.com/.test(href) ? "producthunt"
      : /instagram\.com/.test(href) ? "instagram"
      : /facebook\.com/.test(href) ? "fb-groups"
      : /tiktok\.com/.test(href) ? "tiktok"
      : /youtube\.com|youtu\.be/.test(href) ? "youtube"
      : /reddit\.com/.test(href) ? "reddit"
      : /linkedin\.com/.test(href) ? "linkedin"
      : /news\.ycombinator\.com/.test(href) ? "hn"
      : "blog";
    await fetch("https://growthdeck.0xben.com/api/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        project: slug,
        channel,
        type: tag || "other",
        title: what,
        url: href || "",
        source: "tinyship",
      }),
      signal: AbortSignal.timeout(5000),
    });
    console.log("📡  Logged to growthdeck");
  }
} catch {
  console.error("⚠️  growthdeck dual-write skipped (offline or unreachable).");
}
