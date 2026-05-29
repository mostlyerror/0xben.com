#!/usr/bin/env node
// Log a ship in one command. Prepends a dated entry to the `shipped`
// array in lib/site.ts, commits, and (by default) deploys to production.
//
//   npm run ship -- "What you shipped" [https://link]
//   npm run ship -- "Wrote a post about X" https://… --no-deploy
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

if (!what) {
  console.error('Usage: npm run ship -- "What you shipped" [https://link] [--no-deploy] [--dry]');
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
  ` },`;

console.log("\n📦  New ship:\n" + entry + "\n");

if (flags.has("--dry")) {
  console.log("(--dry — nothing written)");
  process.exit(0);
}

// Insert directly after the marker line → keeps the ledger newest-first.
const updated = src.replace(new RegExp(`(.*${MARKER}.*\\n)`), `$1${entry}\n`);
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

if (flags.has("--no-deploy")) {
  console.log("Skipped deploy (--no-deploy). Run `vercel deploy --prod` when ready.");
  process.exit(0);
}

try {
  console.log("🚀  Deploying to production…");
  run("vercel deploy --prod --yes");
  console.log("\n🎉  Shipped and live.");
} catch {
  console.error("⚠️  Deploy failed — change is committed locally. Run `vercel deploy --prod` manually.");
}
