# Tweet Drafter (`tinyship tweet`) — Design

**Date:** 2026-06-05
**Status:** Approved design, pre-implementation
**Goal:** Grow Ben's maker brand on @mostly_error by removing the friction
between "I have learnings and shipping work" and "a tweet is drafted and ready
to post." Drafting only. No auto-posting (that is the paid part we skip).

## Problem

Ben builds constantly and captures learnings (35+ files in `~/dev/learnings/`),
but turning that raw material into maker-brand tweets is manual and rarely
happens. He wants a low-effort way to get good draft tweets across a few content
pillars, review them, and post the keepers himself from @mostly_error.

Constraint: no paying to fully automate. X API write access is the paid piece,
so posting stays manual. Drafting must add no recurring cost and no new keys.

## Content pillars (the voice)

Four pillars, decided with Ben:

1. **Teach from learnings** — non-obvious insights mined from `~/dev/learnings`.
2. **Build-in-public progress** — honest notes from recent ships.
3. **Hot takes** — sharper, opinion-framed distillations of the same learnings.
4. **Useful-tool recs** — tools/services Ben genuinely uses. First-class once a
   stack page (`lib/stack.ts`) exists; for v1, sourced only from any ideas
   already sitting in `docs/tweet-queue.md`.

## Approach (decided)

**In-session skill, not an API-calling script.** The tinyship scripts are
deterministic Node and cannot write a good tweet. Rather than add an Anthropic
API key + per-batch cost + an `infra.yaml` entry, drafting is done by Claude in
a session (the same way `/learn publish` and `tinyship draft` already work — Ben
runs tinyship by talking to Claude). This keeps cost at zero, adds no new keys,
and touches no infrastructure.

Split of responsibilities:

- **`scripts/tweet.mjs` (gather):** deterministic. Collects source material and
  prints a structured brief. Writes no tweets.
- **`tweet` skill (draft):** Claude reads the brief, writes the tweets in Ben's
  voice, appends them to `docs/tweet-queue.md`.

## Components

### 1. `scripts/tweet.mjs` — the gather script

Run via `tinyship tweet [count]`. Mirrors the structure of `scripts/draft.mjs`
(reads `lib/site.ts`, resolves repo root from `import.meta.url`, fails soft).

**Inputs / flags:**
- `tinyship tweet` — default batch size 6.
- `tinyship tweet 8` — batch size 8.
- `--pillar=teach|build|take|tool` — bias the brief toward one pillar.
- `--dry` — print the brief and exit (this script never writes tweets anyway;
  `--dry` is kept for parity and means "show raw material only, no formatting").

**What it gathers:**
- **Recent ships:** parse the ledger entries from `lib/site.ts` (the
  `{ date, what, href?, tag, project? }` objects), keep the most recent ~14 days
  worth (cap ~12 entries). Feeds the build-in-public pillar.
- **Learnings sample:** read `~/dev/learnings/*.md`. For each, parse front-matter
  (`topic`, `category`, `tags`, `project`, `date`) and extract the
  `## The Non-Obvious Thing` section body (fallback to `## Concept`). Prefer
  newest by `date`. Skip any learning whose `topic` already appears in
  `docs/tweet-queue.md` (light anti-repetition). Sample up to ~8.
- **Tool-rec leftovers:** read any existing bullet ideas in
  `docs/tweet-queue.md` so they are surfaced in the brief rather than lost.

**Output:** a structured plaintext brief to stdout, sectioned by pillar, e.g.

```
=== TWEET BRIEF — draft 6, pillars: teach, build, take, tool ===

[RECENT SHIPS — for build-in-public]
- Jun 5  build  PickleRadar  "Added share-to-group feature"
- Jun 3  post   ClusterDesk  "Tweeted a cluster follow-up"
...

[LEARNINGS — for teach + hot-take]
- impressions-arent-follows (distribution): <non-obvious section text>
- designing-for-honest-smallness (design): <non-obvious section text>
...

[TOOL IDEAS already in queue]
- Claude Code screenshot-to-clipboard hack
- PostHog AI for funnels
```

### 2. `tinyship tweet` dispatch

One branch added to `scripts/tinyship.mjs`, identical shape to the existing
`sync` / `draft` / `pulse` branches:

```js
if (sub === "tweet") {
  run("tweet.mjs", argv.slice(1));
  process.exit(0);
}
```

### 3. The `tweet` skill

A new skill (sibling to the `tinyship` skill) that instructs Claude:

- When Ben asks for tweet drafts (or says "draft me some tweets"), run
  `tinyship tweet [count] [--pillar=...]` and read the brief.
- Write N drafts spread across the pillars (respect `--pillar` bias). Single
  tweets where one will do; short threads where a learning is thread-shaped.
- **Voice rules:** no emdashes (use commas / periods / parentheses); honest,
  no vanity-metric claims, only true numbers; manifesto-adjacent tone (ship
  tiny, distribution beats perfection). Never fabricate a metric or outcome.
- Append each draft to `docs/tweet-queue.md`, newest at top, each tagged with
  its pillar + source (e.g. learning slug) + date, matching the existing file
  format ("pull one, polish, post, delete the line").
- Show the batch in the response so Ben can react immediately.

## Data flow

```
tinyship tweet
  -> scripts/tweet.mjs gathers (ledger + learnings + queue leftovers)
  -> prints structured brief
  -> Claude (tweet skill) reads brief, writes drafts in Ben's voice
  -> appends to docs/tweet-queue.md
  -> Ben reviews, polishes, posts manually from @mostly_error, deletes the line
```

## Review loop (unchanged)

`docs/tweet-queue.md` stays the single review surface. No auto-posting, no new
UI. Posting is manual and deliberate.

## Error handling

- Missing `~/dev/learnings` or unreadable files: skip them, still emit ships.
- Empty window (no recent ships and no learnings): print
  "Nothing fresh to draft from — go build or learn something" and exit 0
  (mirrors `draft.mjs`'s empty-state voice).
- Front-matter / section parse failures on a single learning: skip that file,
  do not crash the batch.

## Testing

- `tinyship tweet --dry` prints a sane brief against the real repo.
- Brief includes recent ledger entries and excludes learnings already echoed in
  the queue.
- Skill run produces drafts that land in `docs/tweet-queue.md` in the existing
  format, with no emdashes and no invented numbers.

## Explicitly out of scope (v1)

- Auto-posting to X (paid; deliberately excluded).
- `lib/stack.ts` and a tools/uses page (separate feature, Ben chose to do the
  drafter first; the tool-rec pillar stays light until that lands).
- Heavy de-dup state / "already posted" tracking (queue-topic check is enough).
- Per-pillar analytics or scheduling.

## Infrastructure

No `infra.yaml` change: no new env var, service, or key. Drafting runs in-session
via Claude; the gather script only reads local files.
