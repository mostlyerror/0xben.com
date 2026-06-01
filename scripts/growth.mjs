#!/usr/bin/env node
// Log a growth datapoint in one command. Appends a dated { date, value } to a
// growth `series` in lib/site.ts, commits, and pushes (Vercel's GitHub
// integration then builds & deploys automatically).
//
//   npm run growth -- clusterdesk 47        # @clusterdesk now at 47 followers
//   npm run growth -- noyu-followers 120
//   npm run growth -- raincheck 6 --dry     # preview only, writes nothing
//   npm run growth                          # lists the valid keys
//
// Only log numbers you actually read off the profile. The wall stays honest.

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");
const src = readFileSync(sitePath, "utf8");

// Pull the keys that exist in the growth array so a typo prints the options.
const gStart = src.indexOf("export const growth");
const gBlock = gStart >= 0 ? src.slice(gStart, src.indexOf("\n];", gStart)) : "";
const keys = [...gBlock.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1]);

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [key, valueRaw] = args.filter((a) => !a.startsWith("--"));

if (!key || valueRaw == null) {
  console.error('Usage: npm run growth -- <key> <number> [--dry]');
  if (keys.length) console.error("\nValid keys:\n  " + keys.join("\n  "));
  process.exit(1);
}
if (!keys.includes(key)) {
  console.error(`Unknown key "${key}".\n\nValid keys:\n  ` + keys.join("\n  "));
  process.exit(1);
}
const value = Number(valueRaw);
if (!Number.isFinite(value) || value < 0) {
  console.error(`"${valueRaw}" is not a valid number.`);
  process.exit(1);
}

const date = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const point = `{ date: ${JSON.stringify(date)}, value: ${value} }`;

// Find the matching growth object, then append the point to its series: [ ... ].
// Anchor on the unique `key: "<key>"` line so sibling entries are never touched.
const objRe = new RegExp(`(key:\\s*"${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}"[\\s\\S]*?series:\\s*\\[)([^\\]]*)(\\])`);
if (!objRe.test(src)) {
  console.error(`Couldn't locate the series array for "${key}" in lib/site.ts.`);
  process.exit(1);
}

const updated = src.replace(objRe, (_whole, head, body, close) => {
  const trimmed = body.trim();
  const sep = trimmed === "" ? "" : trimmed.endsWith(",") ? " " : ", ";
  return `${head}${trimmed}${sep}${point}${close}`;
});

console.log(`\n📈  ${key} → ${value}  (${date})\n`);

if (dry) {
  console.log("(--dry — nothing written)");
  process.exit(0);
}

writeFileSync(sitePath, updated);
console.log("✅  Added to lib/site.ts");

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });
try {
  run("git add lib/site.ts");
  run(`git commit -m ${JSON.stringify(`Growth: ${key} → ${value}`)}`);
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
