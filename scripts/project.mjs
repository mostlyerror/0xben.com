#!/usr/bin/env node
// Register a new project in one command. Adds it to the `projects` array
// in lib/site.ts, also logs a "Launched <name>" ship (tag: launch),
// commits, and pushes (Vercel builds via GitHub integration). Registering a
// project IS a ship.
//
//   npm run project -- "PickleRadar" https://pickleradar.app "Houston pickleball tournaments" --emoji=🏓 --metric=tournaments
//   npm run project -- "Thing" https://thing.com "Desc" --no-ship --dry

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const flag = (name, def) => {
  const f = args.find((a) => a.startsWith(`--${name}=`));
  return f ? f.slice(name.length + 3) : def;
};
const [name, href, description] = args.filter((a) => !a.startsWith("--"));

if (!name || !href) {
  console.error(
    'Usage: npm run project -- "Name" https://url "One-line description" [--emoji=🚀] [--metric=users] [--value=—] [--no-ship] [--dry]',
  );
  process.exit(1);
}

const emoji = flag("emoji", "📦");
const metricLabel = flag("metric", "users");
const metricValue = flag("value", "—");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");
let src = readFileSync(sitePath, "utf8");

const PROJ_MARKER = "// project:insert";
const SHIP_MARKER = "// ship:insert";
if (!src.includes(PROJ_MARKER)) {
  console.error(`Couldn't find "${PROJ_MARKER}" in lib/site.ts.`);
  process.exit(1);
}

const projectEntry = [
  "  {",
  `    name: ${JSON.stringify(name)},`,
  `    description: ${JSON.stringify(description ?? "")},`,
  `    href: ${JSON.stringify(href)},`,
  `    metricLabel: ${JSON.stringify(metricLabel)},`,
  `    metricValue: ${JSON.stringify(metricValue)},`,
  `    emoji: ${JSON.stringify(emoji)},`,
  "  },",
].join("\n");

const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const shipEntry = `  { date: ${JSON.stringify(date)}, what: ${JSON.stringify(`Launched ${name}`)}, href: ${JSON.stringify(href)}, tag: "launch", project: ${JSON.stringify(name)} },`;
const alsoShip = !has("no-ship");

console.log("\n🆕  New project:\n" + projectEntry + "\n");
if (alsoShip) console.log("📦  + ship:\n" + shipEntry + "\n");

if (has("dry")) {
  console.log("(--dry — nothing written)");
  process.exit(0);
}

src = src.replace(new RegExp(`(.*${PROJ_MARKER}.*\\n)`), `$1${projectEntry}\n`);
if (alsoShip && src.includes(SHIP_MARKER)) {
  src = src.replace(new RegExp(`(.*${SHIP_MARKER}.*\\n)`), `$1${shipEntry}\n`);
}
writeFileSync(sitePath, src);
console.log("✅  Added to lib/site.ts" + (alsoShip ? " (+ launch logged in Shipped)" : ""));

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });
try {
  run("git add lib/site.ts");
  run(`git commit -m ${JSON.stringify(`Add project: ${name}`)}`);
  console.log("✅  Committed");
} catch {
  console.error("⚠️  Commit skipped/failed — file updated; commit manually.");
}

try {
  run("git push");
  console.log("\n🚀  Pushed. Vercel's GitHub integration will build & deploy it.");
} catch {
  console.error("⚠️  Push skipped (offline or no upstream) — committed locally, push when ready.");
}
