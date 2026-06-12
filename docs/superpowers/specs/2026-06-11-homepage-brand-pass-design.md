# Homepage Brand Pass — Design

**Date:** 2026-06-11
**Status:** Approved

## Context

0xben.com has a dual purpose: a self-motivation shipping wall for Ben AND a
brand-building asset for strangers evaluating him (maker brand on
@mostly_error, consulting funnel for vibe-coders). The page today is built
almost entirely for Ben-the-user: cockpit metrics, shame-red counters,
"not promoted yet" labels, internal-shorthand ledger entries. A stranger
landing from an X profile click has no next step.

Decision: each conversion path gets one quiet door, layered by page position
(consulting lead > follow > subscribe). This slice fixes the existing
homepage; new surfaces (build log pages, OG image, /stack, notes) are
separate future ships.

## Scope

### 1. Cockpit/brand split (subtractions)

Remove from the public page:

- "not promoted yet" labels and the per-project distribution chips
  (`ProjectDistribution` in `app/page.tsx`). Growthdeck already owns
  silence-is-the-alarm; nothing is lost.
- The "The numbers" stat-card section (follower-count cards) entirely.
  Growth deltas on project cards already tell the story better.

Change:

- "last shipped N days ago" counter: keep, but always neutral color
  publicly. No red/amber shame states on the public page.

Keep every positive signal: heatmap, streak, ships-this-month, total count,
fresh dots, growth deltas, Product Hunt chip, channel chips.

### 2. Three doors, layered by position (additions)

- **Door 1 — work with me:** one plain sentence at the end of the bio in
  the sticky left column, with a mailto link. No services page. Copy in
  plain human voice, no emdashes. Direction: "I help vibe-coders ship real
  products. Email me."
- **Door 2 — follow:** consolidate the scattered follow affordances
  (social icons + tinyship box "follow the build" link) into one clear
  follow line near the Shipped ledger.
- **Door 3 — subscribe:** an RSS feed of the ledger at `/feed.xml`
  (generated from the static `shipped` data in `lib/site.ts`), linked
  quietly in the footer. Email capture is deferred until a notes/learnings
  section exists.

### 3. Highlights

- Add a `featured` flag to ledger entries in `lib/site.ts` (or a
  `highlights` list referencing entries — implementer's choice, prefer the
  flag for one source of truth).
- 3-5 pinned ships render as a small strip at the top of the right column,
  above "What I'm building". Each: one stranger-readable line + link.
- This is the first thing a profile-clicker sees.

### 4. Ledger gloss

- Optional `gloss` field on shipped entries. When present, the gloss is
  the visible ledger line and the raw log line moves into the expandable
  details.
- Backfill only the top ~10 entries (most recent / most visible).

## Out of scope

- Build log permalink pages (`explore/feed` branch), dynamic OG image,
  /stack page, notes/learnings, email capture — all separate future ships.
- Moving nudge logic INTO Growthdeck — it already tracks distribution
  freshness; this slice only removes the public duplicates.
- Any infra change. No new env vars or services; `infra.yaml` untouched.

## Verification

- Before/after screenshot of the homepage presented for review.
- `/feed.xml` validates as RSS and lists ledger entries newest-first.
- No "not promoted yet", red freshness colors, or stat cards render
  publicly.
- All three doors visible at their positions; mailto and follow links work.

## Copy rules

Plain human voice. No emdashes anywhere in site copy.
