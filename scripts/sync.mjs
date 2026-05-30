#!/usr/bin/env node
// Weekly shipping digest. Scans your ~/dev git repos and shows what moved
// in the last N days, so you can SEE everything you built and log the
// highlights with `npm run ship`. Read-only — writes nothing, deploys nothing.
//
//   npm run sync           # last 7 days
//   npm run sync -- 14     # last 14 days

import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const days = Number(process.argv[2]) || 7;
const devDir = join(homedir(), "dev");

if (!existsSync(devDir)) {
  console.error(`No ${devDir} directory found.`);
  process.exit(1);
}

const git = (repo, args) => {
  try {
    return execSync(`git -C "${repo}" ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

const repos = readdirSync(devDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(devDir, e.name, ".git")))
  .map((e) => join(devDir, e.name));

const since = `--since="${days} days ago"`;
const rows = [];
for (const repo of repos) {
  const count = git(repo, `log ${since} --oneline`).split("\n").filter(Boolean).length;
  if (count === 0) continue;
  const firstEver = git(repo, `log --reverse --format=%cd --date=short`).split("\n")[0];
  const isNew = firstEver && new Date(firstEver).getTime() >= Date.now() - days * 86_400_000;
  rows.push({
    name: repo.split("/").pop(),
    count,
    last: git(repo, `log -1 --format=%s`),
    lastDate: git(repo, `log -1 --format=%cd --date=short`),
    isNew,
  });
}

rows.sort((a, b) => b.count - a.count);

const total = rows.reduce((s, r) => s + r.count, 0);
console.log(`\n🛠  What you shipped — last ${days} days  (${rows.length} repos, ${total} commits)\n`);
for (const r of rows) {
  console.log(`  ${r.name.padEnd(26)} ${String(r.count).padStart(3)} commits${r.isNew ? "   🚀 new" : ""}`);
  console.log(`  ${" ".repeat(26)}     last: "${r.last}" (${r.lastDate})`);
}
if (rows.length === 0) console.log("  (nothing in the window — go ship something)");
console.log(`\n💡 Log a highlight:  npm run ship -- "Shipped X" https://link`);
if (rows.some((r) => r.isNew)) {
  console.log(`   New project?       npm run project -- "Name" https://url "desc"`);
}
console.log("");
