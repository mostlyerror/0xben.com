#!/usr/bin/env node
// Gather raw source material for a maker-brand tweet drafter and print a
// STRUCTURED BRIEF to stdout. This script is deterministic: it reads the ship
// ledger, the ~/dev/learnings notes, and the docs/tweet-queue.md backlog, then
// emits a fixed-format brief you (or a downstream LLM step) turn into tweets.
// It writes NOTHING, calls NO API/LLM, and fails soft — a bad file never crashes
// the run; that section just degrades to "(none)".
//
//   node scripts/tweet.mjs                 # default batch of 6, all pillars
//   node scripts/tweet.mjs 10              # batch size 10 (echoed in header)
//   node scripts/tweet.mjs --pillar=teach  # bias toward teach (still prints all)
//   node scripts/tweet.mjs 4 --pillar=tool --dry
//
// --pillar=teach|build|take|tool|vibe : optional bias, noted in the header only.
// --dry                          : parity flag; this script never writes anyway.

import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const count = Number(argv.find((a) => /^\d+$/.test(a))) || 6;
const pillarArg = argv.find((a) => a.startsWith("--pillar="));
const pillar = pillarArg ? pillarArg.slice("--pillar=".length).trim() : "";
// --dry is accepted for parity; this script never writes, so it changes nothing.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = join(root, "lib", "site.ts");
const queuePath = join(root, "docs", "tweet-queue.md");
const learningsDir = join(homedir(), "dev", "learnings");

const safeRead = (p) => {
  try {
    return existsSync(p) ? readFileSync(p, "utf8") : "";
  } catch {
    return "";
  }
};
const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
const clip = (s, n) => {
  const t = norm(s);
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
};

// ---------------------------------------------------------------------------
// 1) RECENT SHIPS — parse the `export const shipped` ledger from lib/site.ts.
// ---------------------------------------------------------------------------
function gatherShips() {
  const src = safeRead(sitePath);
  if (!src) return [];
  const start = src.indexOf("export const shipped");
  if (start < 0) return [];
  const region = src.slice(start);

  const ships = [];
  // Match each top-level object literal { ... } in the ledger region.
  const objRe = /\{([^{}]*)\}/g;
  let m;
  while ((m = objRe.exec(region))) {
    const body = m[1];
    const field = (key) => {
      const fm = body.match(new RegExp(`${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return fm ? fm[1].replace(/\\"/g, '"') : undefined;
    };
    const date = field("date");
    const what = field("what");
    if (!date || !what) continue; // not a ledger entry (e.g. a stray object)
    const parsed = new Date(date);
    ships.push({
      date,
      what,
      tag: field("tag"),
      project: field("project"),
      ts: Number.isNaN(parsed.getTime()) ? null : parsed.getTime(),
    });
  }

  // Newest first (entries with an unparseable date sink to the bottom).
  ships.sort((a, b) => (b.ts ?? -Infinity) - (a.ts ?? -Infinity));

  const now = Date.now();
  const WINDOW = 14 * 24 * 60 * 60 * 1000;
  const recent = ships.filter((s) => s.ts != null && now - s.ts <= WINDOW);

  // Never leave the section empty when history exists: fall back to most recent ~8.
  const chosen = recent.length >= 4 ? recent : ships.slice(0, 8);
  return chosen.slice(0, 12);
}

// ---------------------------------------------------------------------------
// 2) LEARNINGS — parse ~/dev/learnings/*.md frontmatter + body.
// ---------------------------------------------------------------------------
function frontmatterValue(fm, key) {
  const m = fm.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

function sectionBody(body, heading) {
  // Capture text under "## <heading>" up to the next "## " or end of file.
  const re = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, "m");
  const m = body.match(re);
  return m ? m[1] : "";
}

function gatherLearnings() {
  let files;
  try {
    files = existsSync(learningsDir)
      ? readdirSync(learningsDir).filter((f) => f.endsWith(".md"))
      : [];
  } catch {
    return [];
  }

  const queueSrc = safeRead(queuePath).toLowerCase();

  const items = [];
  for (const f of files) {
    try {
      const full = join(learningsDir, f);
      const raw = readFileSync(full, "utf8");
      const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
      const fm = fmMatch ? fmMatch[1] : "";
      const body = fmMatch ? fmMatch[2] : raw;

      const topic = frontmatterValue(fm, "topic");
      const category = frontmatterValue(fm, "category") || "uncategorized";
      const dateStr = frontmatterValue(fm, "date");
      const ts = dateStr ? new Date(dateStr).getTime() : NaN;

      // Light anti-repetition: skip if the topic already appears in the queue.
      if (topic && queueSrc.includes(topic.toLowerCase())) continue;

      let text = sectionBody(body, "The Non-Obvious Thing");
      if (!norm(text)) text = sectionBody(body, "Concept");
      text = clip(text, 280);
      if (!text) continue;

      items.push({
        slug: f.replace(/\.md$/, ""),
        category,
        text,
        ts: Number.isNaN(ts) ? -Infinity : ts,
      });
    } catch {
      // Skip any unreadable / malformed learning file — fail soft.
      continue;
    }
  }

  items.sort((a, b) => b.ts - a.ts); // newest first
  return items.slice(0, 8);
}

// ---------------------------------------------------------------------------
// 3) TOOL IDEAS — top-level bullets already sitting in docs/tweet-queue.md.
// ---------------------------------------------------------------------------
function gatherToolIdeas() {
  const src = safeRead(queuePath);
  if (!src) return [];
  const ideas = [];
  for (const line of src.split("\n")) {
    // Top-level bullets only: "- " with no leading indentation (skip "  - ").
    if (!/^- /.test(line)) continue;
    let text = line.replace(/^- /, "");
    // Strip markdown emphasis / inline code / the trailing _(date)_ stamp.
    text = text
      .replace(/_\([^)]*\)_\s*$/, "")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text) ideas.push(text);
  }
  return ideas;
}

// ---------------------------------------------------------------------------
// Assemble + print the brief.
// ---------------------------------------------------------------------------
const ships = gatherShips();
const learnings = gatherLearnings();
const tools = gatherToolIdeas();

if (ships.length === 0 && learnings.length === 0) {
  console.log("Nothing fresh to draft from — go build or learn something");
  process.exit(0);
}

const pillarLabel = pillar ? pillar : "all";
const out = [];
out.push(`=== TWEET BRIEF — draft ${count}, pillars: ${pillarLabel} ===`);
out.push("");

out.push("[RECENT SHIPS — for build-in-public]");
if (ships.length === 0) {
  out.push("  (none)");
} else {
  for (const s of ships) {
    out.push(`- ${s.date}  ${s.tag || "—"}  ${s.project || "—"}  "${s.what}"`);
  }
}
out.push("");

out.push("[LEARNINGS — for teach + hot-take]");
if (learnings.length === 0) {
  out.push("  (none)");
} else {
  for (const l of learnings) {
    out.push(`- ${l.slug} (${l.category}): ${l.text}`);
  }
}
out.push("");

out.push("[TOOL IDEAS already in queue]");
if (tools.length === 0) {
  out.push("  (none)");
} else {
  for (const t of tools) out.push(`- ${t}`);
}

console.log(out.join("\n"));
