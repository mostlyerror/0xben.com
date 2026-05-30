#!/usr/bin/env node
// Auto-draft ledger entries from recent git activity. Proposes a ship per
// active repo (pre-filled from its latest commit); you approve / edit / tag
// each. Removes the "remember + describe" friction — you stay the curator.
//
//   tinyship draft            # last 7 days, interactive
//   tinyship draft 14         # last 14 days
//   tinyship draft 7 --dry    # just show candidates, write nothing

import { execSync } from "node:child_process";
import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const argv = process.argv.slice(2);
const days = Number(argv.find((a) => /^\d+$/.test(a))) || 7;
const dry = argv.includes("--dry");
const noDeploy = argv.includes("--no-deploy");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");
const devDir = join(homedir(), "dev");

const git = (repo, args) => {
  try {
    return execSync(`git -C "${repo}" ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Map repo dirs to known project display names.
const siteSrc = readFileSync(sitePath, "utf8");
const projIdx = siteSrc.indexOf("export const projects");
const projNames = projIdx >= 0 ? [...siteSrc.slice(projIdx).matchAll(/name: "([^"]+)"/g)].map((m) => m[1]) : [];
const projByNorm = Object.fromEntries(projNames.map((n) => [norm(n), n]));

const since = `--since="${days} days ago"`;
const repos = existsSync(devDir)
  ? readdirSync(devDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(devDir, e.name, ".git")))
      .map((e) => e.name)
  : [];

const candidates = [];
for (const name of repos) {
  const repo = join(devDir, name);
  const n = git(repo, `log ${since} --oneline`).split("\n").filter(Boolean).length;
  if (n === 0) continue;
  candidates.push({
    name,
    n,
    subject: git(repo, `log -1 --format=%s`),
    project: projByNorm[norm(name.replace(/\.com$/, ""))],
  });
}
candidates.sort((a, b) => b.n - a.n);

if (candidates.length === 0) {
  console.log("Nothing in the window — go build something.");
  process.exit(0);
}

if (dry) {
  console.log(`\n📝  Draft candidates — last ${days} days (writes nothing):\n`);
  for (const c of candidates) {
    console.log(`  ${c.name.padEnd(24)} ${String(c.n).padStart(3)} commits${c.project ? `  → ${c.project}` : ""}`);
    console.log(`  ${" ".repeat(24)}     "${c.subject}"`);
  }
  console.log("");
  process.exit(0);
}

const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const rl = createInterface({ input: process.stdin, output: process.stdout });
const approved = [];
console.log(`\n📝  Draft from last ${days} days. For each: [enter]=skip · y=log the commit as-is · or type your own. Then pick a tag.\n`);
for (const c of candidates) {
  console.log(`▸ ${c.name} (${c.n} commits)${c.project ? ` → ${c.project}` : ""}`);
  console.log(`   last: "${c.subject}"`);
  const ans = (await rl.question("   log? [enter=skip / y / your own text]: ")).trim();
  if (!ans) continue;
  const what = ans.toLowerCase() === "y" ? c.subject : ans;
  const kind = (await rl.question("   tag — [enter]=build · p=post · l=launch: ")).trim().toLowerCase();
  const tag = kind === "p" ? "post" : kind === "l" ? "launch" : "build";
  const link = (await rl.question("   link (optional): ")).trim() || undefined;
  approved.push({ what, tag, project: c.project, link });
}
rl.close();

if (approved.length === 0) {
  console.log("\nNothing approved — bye.");
  process.exit(0);
}

const entryStr = (e) =>
  `  { date: ${JSON.stringify(date)}, what: ${JSON.stringify(e.what)}` +
  (e.link ? `, href: ${JSON.stringify(e.link)}` : "") +
  `, tag: ${JSON.stringify(e.tag)}` +
  (e.project ? `, project: ${JSON.stringify(e.project)}` : "") +
  ` },`;

const MARKER = "// ship:insert";
let src = readFileSync(sitePath, "utf8");
src = src.replace(new RegExp(`(.*${MARKER}.*\\n)`), `$1${approved.map(entryStr).join("\n")}\n`);
writeFileSync(sitePath, src);
console.log(`\n✅  Logged ${approved.length} entr${approved.length === 1 ? "y" : "ies"} to the ledger.`);

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });
try {
  run("git add lib/site.ts");
  run(`git commit -m ${JSON.stringify(`Ship: drafted ${approved.length} from sync`)}`);
  console.log("✅  Committed");
} catch {
  console.error("⚠️  commit failed — file is updated; commit manually.");
}
try {
  run("git push");
  console.log("🚀  Pushed. Vercel's GitHub integration will build & deploy it.");
} catch {
  console.error("⚠️  push skipped (offline or no upstream) — committed locally, push when ready.");
}
