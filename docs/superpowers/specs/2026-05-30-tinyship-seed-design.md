# TinyShip — seed (design spec)

**Date:** 2026-05-30
**Status:** approved (design), pending build

## Context

The shipping-momentum system built into 0xben.com (Shipped ledger, tags, streak,
this-month, ship heatmap with 🚀 launches, "last shipped" nudge, build-vs-ship
framing, `ship`/`post`/`project`/`sync` CLI) is, in effect, a product: **TinyShip**
— for builders who commit constantly but rarely ship to the real world.

Strategy (decided in brainstorming): **earn an audience first, monetize later.**
The first move is the tiniest possible: brand the existing system as TinyShip and
give the idea a story to point build-in-public posts at. No app, no backend, no
accounts, no separate route.

## Goal

Plant the TinyShip narrative on 0xben.com so the live page *is* the first TinyShip
and the demo. Increase shipping motivation via a clear point of view.

## Scope — IN

1. **`tinyship` data object in `lib/site.ts`** — editable copy: `wordmark`,
   `manifesto` (string or short lines), `seedLine`, optional `followHref`.
2. **Wordmark on the Shipped section** — a small `🚀 TinyShip` mark / "powered by
   TinyShip" subtag beside the "Shipped" heading.
3. **Inline manifesto block** directly under the Shipped ledger (~40–60 words,
   manifesto voice): the build-vs-ship hook, the real `~353 commits : 1 launch`
   gap, the principle "count launches, not commits," and "ship tiny, ship ugly,
   ship today."
4. **Soft seed line** — e.g. "A real product someday. For now, it's just mine." —
   plus an optional follow link (X `@mostly_error`). No "coming soon" button, no
   dead links.

## Domain note (2026-05-31)

`tinyship.dev` is TAKEN. `tinyship.io` was available as of 2026-05-31 — grab it
when ready to build the standalone product (Porkbun, ~$30-60/yr; Ben has API
keys in `.env`). `.io` fits the indie-SaaS positioning. Decided to hold off for
now, not buy yet.

## Scope — OUT (explicitly deferred)

- A separate `/tinyship` route (decided: no new URL).
- The standalone **tinyship.dev** site (future phase).
- Email capture / waitlist; accounts; billing; any backend.
- The standalone tool / template / CLI distribution.

## Data shape (example)

```ts
export const tinyship = {
  wordmark: "TinyShip",
  manifesto:
    "You don't have a building problem. You have a shipping problem. " +
    "Last week: 353 commits, 1 launch. So I built a wall that counts " +
    "launches, not commits — and dares me to keep it alive. Ship tiny. " +
    "Ship ugly. Ship today.",
  seedLine: "A real product someday. For now, it's just mine.",
  followHref: "https://x.com/mostly_error",
};
```

## Placement & style

- Manifesto sits between the Shipped ledger `<ol>` and the next section (the live
  heatmap + gap stay one eyeful above it — claim next to evidence).
- Visual language matches the minimal site: muted, small, no new colors; the
  wordmark is subtle, not a banner. Reuses existing Tailwind utilities; no new
  dependencies.

## Success criteria

- A visitor reads the manifesto with the real heatmap/gap visible nearby.
- All copy is editable from `lib/site.ts` (no component edits to change words).
- No new routes, deps, or backend; build stays green; deploys as the live site.
```
