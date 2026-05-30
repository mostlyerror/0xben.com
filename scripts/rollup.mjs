#!/usr/bin/env node
// Per-project effort rollup: BUILD (commits) vs SHIPPED (logged), side by side.
// Surfaces projects that are all-build-no-ship — the gap, per project.
//
//   tinyship rollup           # last 30 days
//   tinyship rollup 7         # last 7 days

import { execSync } from "node:child_process";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const days = Number(process.argv[2]) || 30;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const devDir = join(homedir(), "dev");

const git = (repo, args) => {
  try {
    return execSync(`git -C "${repo}" ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

// --- build effort: commits per repo in the window ---
const repos = existsSync(devDir)
  ? readdirSync(devDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(devDir, e.name, ".git")))
      .map((e) => e.name)
  : [];
const since = `--since="${days} days ago"`;
const commits = {}; // key (lowercased) -> count
for (const name of repos) {
  const n = git(join(devDir, name), `log ${since} --oneline`).split("\n").filter(Boolean).length;
  if (n > 0) commits[name.toLowerCase()] = n;
}

// --- logged ships: parse the ledger for { project, tag } ---
const src = readFileSync(join(root, "lib", "site.ts"), "utf8");
// Anchor on the in-array marker so the type's `string[];` doesn't truncate us.
const mStart = src.indexOf("// ship:insert");
const block = mStart >= 0 ? src.slice(mStart, src.indexOf("\n];", mStart)) : "";
const ships = {}; // key (lowercased) -> { name, ships, posts, launches, total }
for (const e of block.match(/\{[^}]*\}/g) || []) {
  const proj = (e.match(/project:\s*"([^"]+)"/) || [])[1];
  if (!proj) continue;
  const tag = (e.match(/tag:\s*"([^"]+)"/) || [])[1];
  const k = proj.toLowerCase();
  ships[k] ??= { name: proj, ships: 0, posts: 0, launches: 0, total: 0 };
  ships[k].total++;
  if (tag === "post") ships[k].posts++;
  else if (tag === "launch") ships[k].launches++;
  else ships[k].ships++;
}

// --- merge & display ---
const keys = [...new Set([...Object.keys(commits), ...Object.keys(ships)])];
const rows = keys
  .map((k) => ({
    name: ships[k]?.name || k,
    commits: commits[k] || 0,
    logged: ships[k]?.total || 0,
    posts: ships[k]?.posts || 0,
    launches: ships[k]?.launches || 0,
  }))
  .sort((a, b) => b.commits - a.commits || b.logged - a.logged);

const totalCommits = rows.reduce((s, r) => s + r.commits, 0);
const totalLogged = rows.reduce((s, r) => s + r.logged, 0);

console.log(`\n📊  Effort rollup — last ${days} days  (${totalCommits} commits built · ${totalLogged} ships logged)\n`);
for (const r of rows) {
  const build = r.commits ? `🔨 ${String(r.commits).padStart(3)} commits` : "      —      ";
  const ship = r.logged
    ? `🚀 ${r.logged} logged${r.posts ? ` · ${r.posts} post${r.posts === 1 ? "" : "s"}` : ""}`
    : "🚀 0 logged";
  const flag = r.commits > 0 && r.logged === 0 ? "   ⚠️  all build, no ship" : r.commits > 0 && r.posts === 0 ? "   🔇 built+shipped, not promoted" : "";
  console.log(`  ${r.name.padEnd(24)} ${build}   ${ship}${flag}`);
}
console.log(`\n💡 Close a gap:  tinyship "<what>" --project=<Name>   ·   tinyship "<post>" --post --project=<Name>\n`);
