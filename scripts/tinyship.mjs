#!/usr/bin/env node
// TinyShip — log a ship from ANYWHERE. No dir-hunting, no command-memorizing.
//
//   tinyship                          → interactive: "What did you ship?"
//   tinyship "Shipped the new map"     → quick ship
//   tinyship "Launch thread" --post --project=PickleRadar --link=https://x.com/...
//   tinyship sync [days]               → weekly shipping digest
//   tinyship project                   → register a new project (interactive)
//
// It knows where the repo lives, so it works from any directory.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scripts = join(root, "scripts");
const sitePath = join(root, "lib", "site.ts");

const run = (file, args) =>
  execFileSync("node", [join(scripts, file), ...args], { cwd: root, stdio: "inherit" });

const projectNames = () => {
  try {
    const src = readFileSync(sitePath, "utf8");
    const i = src.indexOf("export const projects");
    const block = i >= 0 ? src.slice(i) : src;
    return [...block.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
  } catch {
    return [];
  }
};

const argv = process.argv.slice(2);
const sub = argv[0];

if (sub === "sync") {
  run("sync.mjs", argv.slice(1));
  process.exit(0);
}

if (sub === "rollup") {
  run("rollup.mjs", argv.slice(1));
  process.exit(0);
}

if (sub === "draft") {
  run("draft.mjs", argv.slice(1));
  process.exit(0);
}

if (sub === "growth") {
  run("growth.mjs", argv.slice(1));
  process.exit(0);
}

if (sub === "pulse") {
  run("pulse.mjs", argv.slice(1));
  process.exit(0);
}

if (sub === "project") {
  if (argv.length > 1) {
    run("project.mjs", argv.slice(1));
    process.exit(0);
  }
  await wizardProject();
  process.exit(0);
}

// Quick mode: any free text (non-flag) → ship it.
const text = argv.filter((a) => !a.startsWith("--")).join(" ").trim();
if (text) {
  const flags = argv.filter((a) => a.startsWith("--"));
  const tag = flags.includes("--post")
    ? "post"
    : flags.includes("--launch")
      ? "launch"
      : flags.includes("--build")
        ? "build"
        : null;
  const link = (flags.find((f) => f.startsWith("--link=")) || "").slice("--link=".length) || undefined;
  const project = (flags.find((f) => f.startsWith("--project=")) || "").slice("--project=".length) || undefined;
  const args = [text];
  if (link) args.push(link);
  if (tag) args.push(`--tag=${tag}`);
  if (project) args.push(`--project=${project}`);
  if (flags.includes("--dry")) args.push("--dry");
  run("ship.mjs", args);
  process.exit(0);
}

await wizardLog();

async function wizardLog() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const what = (await rl.question("🚀 What did you ship? ")).trim();
    if (!what) {
      console.log("Nothing entered — bye.");
      return;
    }
    const kind = (await rl.question("   Kind — [enter]=ship · p=post · l=launch · b=build: ")).trim().toLowerCase();
    const tag = kind === "p" ? "post" : kind === "l" ? "launch" : kind === "b" ? "build" : null;

    let project;
    if (tag === "post" || tag === "launch") {
      const names = projectNames();
      if (names.length) {
        console.log("   Projects: " + names.map((n, i) => `[${i + 1}] ${n}`).join("  "));
        const pick = (await rl.question("   Project? (number, name, or blank): ")).trim();
        if (pick) project = names[Number(pick) - 1] || pick;
      }
    }
    const link = (await rl.question("   Link? (optional): ")).trim() || undefined;

    const args = [what];
    if (link) args.push(link);
    if (tag) args.push(`--tag=${tag}`);
    if (project) args.push(`--project=${project}`);
    rl.close();
    run("ship.mjs", args);
  } finally {
    rl.close();
  }
}

async function wizardProject() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const name = (await rl.question("🆕 Project name: ")).trim();
    if (!name) {
      console.log("No name — bye.");
      return;
    }
    const url = (await rl.question("   URL: ")).trim();
    const description = (await rl.question("   One-line description: ")).trim();
    const emoji = (await rl.question("   Emoji (optional): ")).trim();
    const metric = (await rl.question("   Metric label (e.g. users): ")).trim();

    const args = [name, url, description];
    if (emoji) args.push(`--emoji=${emoji}`);
    if (metric) args.push(`--metric=${metric}`);
    rl.close();
    run("project.mjs", args);
  } finally {
    rl.close();
  }
}
