# Personal Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-center 0xben.com on Ben the person: a human homepage, the shipping wall moved to `/ships`, and a hand-edited `/now` page.

**Architecture:** Pure content-and-routing change on the existing design system. The homepage's right column is extracted into `components/ships/` and re-mounted at `/ships`. New data exports in `lib/site.ts` (`interests`, `nowPage`, `beliefs`) drive a new homepage right column and the `/now` page. Cadence math becomes a pure tested function shared by both pages.

**Tech Stack:** Next.js 16.3.4 App Router (server components, static prerender), React 19, Tailwind 4 + daisyUI 5, `node --test` for unit tests. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-17-personal-direction-design.md`

## Global Constraints

- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (AGENTS.md). Verified for this plan: `export const metadata` with `title.template` and `title.default`; `import Link from "next/link"`; `import Image from "next/image"`. `cacheComponents` is off, so `Date.now()` in a server page is fine and is frozen at build time, same as today.
- No emdashes in any site copy. Plain human voice.
- No location and no family on the site. Never name the museum.
- Client work is named by type only, never by client name.
- No new dependencies, env vars, or services. `infra.yaml` untouched.
- Never run `npm install` and commit the lockfile: the local npm strips `libc` fields. If `package-lock.json` shows as modified, run `git checkout package-lock.json`.
- The `tinyship` CLI writes `lib/site.ts` at the markers `// project:insert`, `// growth:insert`, `// ship:insert`. Do not move, rename, or reorder those arrays or markers.
- The site is live and main auto-deploys to production. All work happens on the branch `personal-direction`. Commit per task, push the branch for a Vercel preview, open a PR, and do NOT merge to main. Ben reviews the preview and screenshots first.
- Unit tests run with `node --test lib/<name>.test.ts` and import with the `.ts` extension, for example `from "./cadence.ts"`. Test files must not import Next or use the `@/` alias.

## File Structure

| File | Responsibility |
|---|---|
| `lib/cadence.ts` (new) | Pure ship-cadence math from date strings and a clock |
| `lib/cadence.test.ts` (new) | Unit tests for the above |
| `lib/emojiClass.ts` (new) | Emoji to hover-animation class map, shared by project and interest cards |
| `lib/site.ts` (modify) | New copy; new `interests`, `nowPage`, `beliefs` exports |
| `components/ships/ProjectCards.tsx` (new) | "What I'm building" grid and its metric helpers, moved from `app/page.tsx` |
| `components/ships/TinyshipManifesto.tsx` (new) | Manifesto box, moved |
| `components/ships/ShipLedger.tsx` (new) | Shipped header stats, heatmap, follow line, ledger, moved |
| `components/SiteFooter.tsx` (new) | Footer shared by all three pages |
| `components/InterestCards.tsx` (new) | "Outside of work" cards with photo slots |
| `app/page.tsx` (modify) | Human homepage |
| `app/ships/page.tsx` (new) | The wall |
| `app/now/page.tsx` (new) | The now page |
| `app/layout.tsx` (modify) | Title template, no emdash |
| `app/feed.xml/route.ts`, `lib/rss.ts`, `lib/rss.test.ts` (delete) | RSS removal |

## Plan decision not in the spec: staleness rule

The newest ledger entry is Jun 21, 2026. A live "last one N days ago" on the homepage would read 88 days, which advertises the opposite of what the link is for, and the June brand pass already ruled out public shame states. Rule: homepage surfaces and the shared footer show recency only when the last ship is 14 days old or newer. Past that they show the total only. `/ships` always shows the raw label, because that page is Ben's own wall.

---

### Task 1: Cadence math as a pure tested function

**Files:**
- Create: `lib/cadence.ts`
- Test: `lib/cadence.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Cadence = {
    total: number;                 // count of input entries, valid date or not
    daysSinceShip: number | null;  // null when no valid date
    lastShipLabel: string | null;  // "shipped today" | "1 day ago" | "N days ago"
    freshLabel: string | null;     // lastShipLabel when daysSinceShip <= 14, else null
    shipsThisMonth: number;
    weekStreak: number;
  };
  export function shipCadence(dates: string[], nowMs: number): Cadence;
  export const FRESH_DAYS = 14;
  ```

- [ ] **Step 1: Write the failing tests**

`lib/cadence.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { shipCadence } from "./cadence.ts";

const DAY = 86_400_000;
// Fixed clock: noon local time, Jun 21 2026.
const NOW = new Date(2026, 5, 21, 12, 0, 0).getTime();

test("empty ledger yields nulls and zeros", () => {
  const c = shipCadence([], NOW);
  assert.deepEqual(c, {
    total: 0,
    daysSinceShip: null,
    lastShipLabel: null,
    freshLabel: null,
    shipsThisMonth: 0,
    weekStreak: 0,
  });
});

test("a ship today reads 'shipped today' and is fresh", () => {
  const c = shipCadence(["Jun 21, 2026"], NOW);
  assert.equal(c.daysSinceShip, 0);
  assert.equal(c.lastShipLabel, "shipped today");
  assert.equal(c.freshLabel, "shipped today");
});

test("one day ago is singular", () => {
  const c = shipCadence(["Jun 20, 2026"], NOW);
  assert.equal(c.lastShipLabel, "1 day ago");
});

test("uses the newest date regardless of input order", () => {
  const c = shipCadence(["Jun 1, 2026", "Jun 19, 2026", "May 3, 2026"], NOW);
  assert.equal(c.daysSinceShip, 2);
  assert.equal(c.lastShipLabel, "2 days ago");
});

test("stale ledger keeps the raw label but drops the fresh label", () => {
  const c = shipCadence(["Jun 21, 2026"], NOW + 88 * DAY);
  assert.equal(c.daysSinceShip, 88);
  assert.equal(c.lastShipLabel, "88 days ago");
  assert.equal(c.freshLabel, null);
});

test("14 days is still fresh, 15 is not", () => {
  assert.equal(shipCadence(["Jun 21, 2026"], NOW + 14 * DAY).freshLabel, "14 days ago");
  assert.equal(shipCadence(["Jun 21, 2026"], NOW + 15 * DAY).freshLabel, null);
});

test("unparseable dates count toward total but nothing else", () => {
  const c = shipCadence(["not a date", "Jun 20, 2026"], NOW);
  assert.equal(c.total, 2);
  assert.equal(c.daysSinceShip, 1);
  assert.equal(c.shipsThisMonth, 1);
});

test("shipsThisMonth counts only the clock's month and year", () => {
  const c = shipCadence(["Jun 2, 2026", "Jun 19, 2026", "May 30, 2026", "Jun 5, 2025"], NOW);
  assert.equal(c.shipsThisMonth, 2);
});

test("weekStreak counts consecutive 7-day windows back from now", () => {
  // Windows: (Jun14,Jun21], (Jun7,Jun14], (May31,Jun7]; then a gap.
  const c = shipCadence(["Jun 20, 2026", "Jun 10, 2026", "Jun 3, 2026", "May 10, 2026"], NOW);
  assert.equal(c.weekStreak, 3);
});

test("weekStreak is zero when the latest window is empty", () => {
  const c = shipCadence(["Jun 1, 2026"], NOW);
  assert.equal(c.weekStreak, 0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test lib/cadence.test.ts`
Expected: FAIL, cannot find module `./cadence.ts`.

- [ ] **Step 3: Implement**

`lib/cadence.ts`:

```ts
// Ship-cadence math for the ledger. Pure: no Next.js or path-alias imports,
// so `node --test lib/cadence.test.ts` works. The clock is a parameter so the
// server passes one `nowMs` to everything and tests can pin time.

const DAY = 86_400_000;

// Homepage surfaces only show recency this fresh. Past it they show the
// total alone, so the public page never advertises a quiet stretch.
export const FRESH_DAYS = 14;

export type Cadence = {
  total: number;
  daysSinceShip: number | null;
  lastShipLabel: string | null;
  freshLabel: string | null;
  shipsThisMonth: number;
  weekStreak: number;
};

export function shipCadence(dates: string[], nowMs: number): Cadence {
  const times = dates
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));

  const newest = times.length ? Math.max(...times) : null;
  const daysSinceShip =
    newest == null ? null : Math.max(0, Math.floor((nowMs - newest) / DAY));
  const lastShipLabel =
    daysSinceShip == null
      ? null
      : daysSinceShip === 0
        ? "shipped today"
        : daysSinceShip === 1
          ? "1 day ago"
          : `${daysSinceShip} days ago`;
  const freshLabel =
    daysSinceShip != null && daysSinceShip <= FRESH_DAYS ? lastShipLabel : null;

  const now = new Date(nowMs);
  const shipsThisMonth = times.filter((t) => {
    const d = new Date(t);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Consecutive 7-day windows (back from now) that each contain a ship.
  let weekStreak = 0;
  for (let w = 0; w < 520; w++) {
    const end = nowMs - w * 7 * DAY;
    const start = end - 7 * DAY;
    if (!times.some((t) => t > start && t <= end)) break;
    weekStreak++;
  }

  return { total: dates.length, daysSinceShip, lastShipLabel, freshLabel, shipsThisMonth, weekStreak };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test lib/cadence.test.ts`
Expected: 10 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add lib/cadence.ts lib/cadence.test.ts
git commit -m "feat: pure ship-cadence math with a staleness rule"
```

---

### Task 2: Extract the wall into components (pure refactor, homepage unchanged)

After this task the homepage must render exactly as before. No copy or layout changes here.

**Files:**
- Create: `lib/emojiClass.ts`, `components/ships/ProjectCards.tsx`, `components/ships/TinyshipManifesto.tsx`, `components/ships/ShipLedger.tsx`, `components/SiteFooter.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `shipCadence`, `Cadence` from Task 1.
- Produces:
  ```ts
  // lib/emojiClass.ts
  export const emojiClass: Record<string, string>;
  // components/ships/ProjectCards.tsx
  export function ProjectCards(): JSX.Element;          // heading + grid, no manifesto
  // components/ships/TinyshipManifesto.tsx
  export function TinyshipManifesto(): JSX.Element;
  // components/ships/ShipLedger.tsx
  export function ShipLedger(props: { cadence: Cadence; nowMs: number }): JSX.Element;
  // components/SiteFooter.tsx
  export function SiteFooter(props: { freshLabel: string | null }): JSX.Element;
  ```

- [ ] **Step 1: Capture the before state**

```bash
npx next build >/dev/null 2>&1 && npx next start -p 4010 >/dev/null 2>&1 &
npx -y playwright@1 screenshot --viewport-size=1440,2400 --full-page http://localhost:4010 "$SCRATCH/before-home-1440.png"
npx -y playwright@1 screenshot --viewport-size=400,2400 --full-page http://localhost:4010 "$SCRATCH/before-home-400.png"
curl -s http://localhost:4010 | sed 's/<script[^>]*>.*<\/script>//g' > "$SCRATCH/before-home.html"
kill %1
```

`$SCRATCH` is the session scratchpad directory. If playwright needs a browser: `npx -y playwright@1 install chromium`.

- [ ] **Step 2: Create `lib/emojiClass.ts`**

Move the `emojiClass` map and its comment out of `app/page.tsx` verbatim, then add the interest emoji so Task 5 needs no CSS:

```ts
// Per-card emoji hover personality (see globals.css). Keys must match the
// emoji literals in lib/site.ts exactly, including any U+FE0F variation
// selector. Unmapped emoji fall back to the base .toy-emoji pop.
export const emojiClass: Record<string, string> = {
  // projects
  "🏓": "emoji-pickle",
  "🌦️": "emoji-rain",
  "📈": "emoji-chart",
  "💌": "emoji-letter",
  "📞": "emoji-phone",
  "🌐": "emoji-globe",
  "🍽️": "emoji-plate",
  "🌡️": "emoji-temp",
  // interests (reuse existing animations, no new CSS)
  "🎨": "emoji-plate",
  "🀄": "emoji-letter",
  "💃": "emoji-plate",
  "⚽": "emoji-pickle",
  "🏋️": "emoji-temp",
  "🧘": "emoji-temp",
  "🍳": "emoji-plate",
  "📚": "emoji-letter",
};
```

- [ ] **Step 3: Create `components/ships/ProjectCards.tsx`**

Header:

```tsx
import type { CSSProperties } from "react";
import { projects, shipped, growth } from "@/lib/site";
import { emojiClass } from "@/lib/emojiClass";
import { Sparkline } from "@/components/Sparkline";

type Project = (typeof projects)[number];
```

Move verbatim from `app/page.tsx`, comments included: `daysAgo`, `growthView`, `isFresh`, `ProductHuntChip`, `ProjectChannels`, `headlineLine`, `HeadlineMetric`, `ProjectGrowth`. Then export:

```tsx
export function ProjectCards() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        What I'm building
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {/* the existing projects.map(...) card JSX, moved verbatim */}
      </div>
    </section>
  );
}
```

The `projects.map` block is the `<a className="toy-card rise group ...">` element and everything inside it, moved verbatim. The manifesto box does NOT move here.

- [ ] **Step 4: Create `components/ships/TinyshipManifesto.tsx`**

```tsx
import { tinyship } from "@/lib/site";

export function TinyshipManifesto() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
        <span className="font-semibold text-black dark:text-white">
          🚀 {tinyship.wordmark}
        </span>{" "}
        {tinyship.manifesto}
      </p>
      <p className="text-xs text-black/40 dark:text-white/40">{tinyship.seedLine}</p>
    </div>
  );
}
```

The original had `mt-1` because it sat inside the projects section's `gap-6`. In Task 3 it sits inside the same section wrapper, so keep spacing by placing it as a sibling inside a `flex flex-col gap-6` wrapper (see Step 6).

- [ ] **Step 5: Create `components/ships/ShipLedger.tsx`**

```tsx
import { shipped, tinyship } from "@/lib/site";
import type { Cadence } from "@/lib/cadence";
import { ShipHeatmap } from "@/components/ShipHeatmap";

export function ShipLedger({ cadence, nowMs }: { cadence: Cadence; nowMs: number }) {
  const { lastShipLabel, shipsThisMonth, weekStreak, total } = cadence;
  return (
    <section className="flex flex-col gap-5">
      {/* existing "Shipped" section body, moved verbatim, with these swaps:
          shipped.length        -> total
          now.getTime()         -> nowMs                                  */}
    </section>
  );
}
```

Move the `Tag` helper into this file verbatim. `@/lib/cadence` is a type-only import here, so the no-alias rule for test files is not affected.

- [ ] **Step 6: Create `components/SiteFooter.tsx`**

```tsx
import { site } from "@/lib/site";
import { FooterRotator } from "@/components/FooterRotator";

export function SiteFooter({ freshLabel }: { freshLabel: string | null }) {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-sm text-black/40 dark:text-white/40">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </span>
      <BuildStamp />
      <a href="/feed.xml" className="underline-offset-2 hover:underline" title="RSS feed of the shipping log">
        · RSS
      </a>
      {freshLabel && (
        <span title="Newest entry on the shipping wall">
          · {freshLabel === "shipped today" ? "last shipped today" : `last shipped ${freshLabel}`}
        </span>
      )}
      <span className="w-full" />
      <FooterRotator />
    </footer>
  );
}
```

Move `BuildStamp` into this file verbatim. The RSS link stays for now and is removed in Task 6. Two deliberate behavior changes, both from the staleness rule: the stat hides past 14 days, and the wording becomes "last shipped 2 days ago" instead of "2d ago".

- [ ] **Step 7: Rewire `app/page.tsx`**

Replace the derived-stat block at the top of `Home()` with:

```tsx
const nowMs = Date.now();
const cadence = shipCadence(shipped.map((s) => s.date), nowMs);
```

Replace the right column body with:

```tsx
<div className="flex flex-col gap-14">
  <div className="flex flex-col gap-6">
    <ProjectCards />
    <TinyshipManifesto />
  </div>
  <ShipLedger cadence={cadence} nowMs={nowMs} />
</div>
```

Replace the `<footer>…</footer>` with `<SiteFooter freshLabel={cadence.freshLabel} />`. Delete the moved helpers, `computeWeekStreak`, the `emojiClass` map, and now-unused imports. `Linkified` and `WavingHeadline` stay in `app/page.tsx`.

- [ ] **Step 8: Verify nothing changed**

```bash
npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: build passes, routes `/` and `/feed.xml` listed. Then re-run the Step 1 screenshot and curl commands with `after-refactor-` prefixes and compare:

```bash
diff <(sed 's/ class="[^"]*"//g' "$SCRATCH/before-home.html") <(sed 's/ class="[^"]*"//g' "$SCRATCH/after-refactor-home.html") | head -20
```

Expected: the only text difference is the footer stat, which disappears because the ledger is 88 days stale. Open both 1440 screenshots and confirm the page is otherwise identical.

- [ ] **Step 9: Commit**

```bash
git add lib/emojiClass.ts components/ships components/SiteFooter.tsx app/page.tsx
git commit -m "refactor: extract the shipping wall and footer into components"
```

---

### Task 3: The /ships page

**Files:**
- Create: `app/ships/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ProjectCards`, `TinyshipManifesto`, `ShipLedger`, `SiteFooter`, `shipCadence`.

- [ ] **Step 1: Title template in `app/layout.tsx`**

Replace the `metadata` export:

```tsx
const defaultTitle = `${site.name} · ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s · ${site.name}` },
  description: site.bio[0],
  openGraph: {
    title: defaultTitle,
    description: site.bio[0],
    url: site.url,
    siteName: site.domain,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: site.bio[0],
  },
};
```

- [ ] **Step 2: Create `app/ships/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { shipped } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { ProjectCards } from "@/components/ships/ProjectCards";
import { TinyshipManifesto } from "@/components/ships/TinyshipManifesto";
import { ShipLedger } from "@/components/ships/ShipLedger";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Ships",
  description: "Everything I've built and shipped, with the numbers behind it.",
};

export default function ShipsPage() {
  const nowMs = Date.now();
  const cadence = shipCadence(shipped.map((s) => s.date), nowMs);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          ← Ben
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ships</h1>
        <p className="max-w-xl text-black/60 dark:text-white/60">
          The small products I build on the side, and a log of every time one of them met the real world.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ProjectCards />
        <TinyshipManifesto />
      </div>

      <ShipLedger cadence={cadence} nowMs={nowMs} />

      <SiteFooter freshLabel={cadence.freshLabel} />
    </main>
  );
}
```

`max-w-5xl` rather than the homepage's `max-w-7xl`: there is no left column here, and the 3-column card grid reads best near the width it had on the homepage.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: `/ships` appears in the route list as static. Start the server, screenshot `/ships` at 1440 and 400, and check: back link works, cards and ledger match the homepage's, tab title reads "Ships · Ben".

- [ ] **Step 4: Commit**

```bash
git add app/ships app/layout.tsx
git commit -m "feat: /ships page hosts the shipping wall; title template without emdash"
```

---

### Task 4: New copy, new data, and the /now page

**Files:**
- Modify: `lib/site.ts`
- Create: `app/now/page.tsx`

**Interfaces:**
- Produces, in `lib/site.ts`:
  ```ts
  export const interests: { id: string; emoji: string; name: string; line?: string; photo?: string; photoHint?: string }[];
  export const nowPage: { updated: string; items: { emoji: string; text: string }[] };
  export const beliefs: string[];
  ```

- [ ] **Step 1: Rewrite the copy in `lib/site.ts`**

In `site`:

```ts
  tagline: "Software engineer, oil painter, pickleball singles player. I run Good Robot Co.",
  bio: [
    "I'm Ben. I've been writing software for about 14 years, most recently as a senior engineer at Landing, and at a handful of startups before that.",
    "Then I burned out. I took real time off. I traveled, started oil painting, danced a lot of salsa and bachata, did the self-awareness work, and put time into friends and community.",
    "I came back wanting to build things that matter. Today I run Good Robot Co, a one-person shop. The project I'm most excited about is custom EHR software for orthotics and prosthetics clinics.",
  ],
```

Replace `now` (keep its comment about never expanding client names):

```ts
export const now = "Right now: building clinic software, painting, and getting ready for mahjong night.";
```

Replace `status`:

```ts
export const status: string[] = [
  "painting badly on purpose",
  "drilling singles serves",
  "hosting mahjong night",
  "fueled by cold brew",
  "probably renaming a variable",
];
```

`workWithMe`, `inlineLinks`, `tinyship`, `socials`, `projects`, `growth`, `shipped` are untouched.

- [ ] **Step 2: Add the new exports to `lib/site.ts`**

Insert directly after the `status` export, above `tinyship`, so the three CLI-managed arrays and their markers keep their positions relative to each other:

```ts
// ── Outside of work. The human half of the homepage. ──
// `photo` is a path under /public (e.g. "/photos/painting.jpg"). Leave it
// unset until the real photo exists: development shows a labeled placeholder
// box, production renders no slot at all, so the live site never shows an
// empty frame. `photoHint` says what belongs in the slot.
// IDs are stable handles. Do not rename them once photos are attached.
export const interests: {
  id: string;
  emoji: string;
  name: string;
  line?: string;
  photo?: string;
  photoHint?: string;
}[] = [
  { id: "painting", emoji: "🎨", name: "Oil painting", line: "Sold paintings in a show. Taking a class at a museum.", photoHint: "one of your paintings" },
  { id: "pickleball", emoji: "🏓", name: "Pickleball", line: "Four times a week. Tournaments, mostly singles.", photoHint: "you on court" },
  { id: "mahjong", emoji: "🀄", name: "Mahjong", line: "American and Hong Kong styles. I host socials with friends.", photoHint: "a table mid-game" },
  { id: "dance", emoji: "💃", name: "Salsa and bachata", line: "Social dancing.", photoHint: "a dance floor shot" },
  { id: "soccer", emoji: "⚽", name: "Soccer trips", line: "Traveling to watch my teams play." },
  { id: "moving", emoji: "🏋️", name: "Moving", line: "Lifting, yoga, pilates, running." },
  { id: "meditation", emoji: "🧘", name: "Meditation" },
  { id: "cooking", emoji: "🍳", name: "Cooking" },
  { id: "reading", emoji: "📚", name: "Reading" },
];

// ── The /now page. Hand-edited. Bump `updated` whenever you touch it. ──
// The first three items also show as the "Now" teaser on the homepage, so
// keep the most current things at the top.
export const nowPage: { updated: string; items: { emoji: string; text: string }[] } = {
  updated: "Sep 17, 2026",
  items: [
    { emoji: "🀄", text: "Hosting our third mahjong social soon." },
    { emoji: "⚽", text: "Barcelona and London this month to watch my favorite teams." },
    { emoji: "🦿", text: "Building custom EHR software for orthotics and prosthetics clinics." },
    { emoji: "🎨", text: "Taking an oil painting class." },
    { emoji: "🏔️", text: "Booking an artist retreat in Switzerland for the spring." },
    { emoji: "🏓", text: "Playing singles tournaments." },
  ],
};

// ── Things I believe. Empty hides the section entirely. ──
export const beliefs: string[] = [];
```

Order note: the spec listed the painting class third. The clinic software moves up to third so the homepage teaser, which shows the first three, carries one work item.

- [ ] **Step 3: Create `app/now/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { nowPage, shipped } from "@/lib/site";
import { shipCadence } from "@/lib/cadence";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm doing, making, and looking forward to right now.",
};

export default function NowPage() {
  const cadence = shipCadence(shipped.map((s) => s.date), Date.now());

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          ← Ben
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Now</h1>
        <p className="text-sm text-black/45 dark:text-white/45">Updated {nowPage.updated}</p>
      </header>

      {nowPage.items.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">Nothing here yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col">
          {nowPage.items.map((item, i) => (
            <li
              key={i}
              className="flex items-baseline gap-4 border-t border-black/[0.06] py-4 first:border-t-0 dark:border-white/[0.08]"
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="leading-relaxed text-black/80 dark:text-white/80">{item.text}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-black/45 dark:text-white/45">
        This is a{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          now page
        </a>
        . It changes when my life does.
      </p>

      <SiteFooter freshLabel={cadence.freshLabel} />
    </main>
  );
}
```

- [ ] **Step 4: Verify**

```bash
grep -n "—" lib/site.ts | grep -vE "^\s*[0-9]+:\s*//" | grep -vE "what:|details:|gloss:|description:" 
npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: the grep prints no line from the new copy (existing ledger and project entries contain emdashes and are out of scope). `/now` appears in the route list. Screenshot `/now` at 1440 and 400; tab title reads "Now · Ben".

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts app/now
git commit -m "feat: personal copy, interests and now data, /now page"
```

---

### Task 5: The human homepage

**Files:**
- Create: `components/InterestCards.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `interests`, `nowPage`, `beliefs` (Task 4); `emojiClass` (Task 2); `Cadence` (Task 1).

- [ ] **Step 1: Create `components/InterestCards.tsx`**

```tsx
import type { CSSProperties } from "react";
import Image from "next/image";
import { interests } from "@/lib/site";
import { emojiClass } from "@/lib/emojiClass";

type Interest = (typeof interests)[number];

// Photo slot. A real photo always renders. With no photo: development shows
// a labeled dashed box so the missing asset is an obvious checklist item;
// production renders nothing, so visitors never see an empty frame.
function PhotoSlot({ interest: it }: { interest: Interest }) {
  if (it.photo) {
    return (
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={it.photo}
          alt={it.name}
          fill
          sizes="(min-width: 1280px) 18rem, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }
  if (process.env.NODE_ENV === "production" || !it.photoHint) return null;
  return (
    <div className="mb-3 flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 bg-black/[0.02] text-center dark:border-white/20 dark:bg-white/[0.03]">
      <span className="font-mono text-xs text-black/60 dark:text-white/60">photo-{it.id}</span>
      <span className="text-[11px] text-black/40 dark:text-white/40">{it.photoHint}</span>
      <span className="text-[10px] text-black/30 dark:text-white/30">dev only</span>
    </div>
  );
}

export function InterestCards() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        Outside of work
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {interests.map((it, i) => (
          <div
            key={it.id}
            style={{ "--i": i } as CSSProperties}
            className="toy-card rise flex flex-col rounded-xl border border-black/[0.08] p-3 sm:p-4 dark:border-white/[0.08]"
          >
            <PhotoSlot interest={it} />
            <div className="flex items-center gap-2.5">
              <span className={`toy-emoji text-lg leading-none ${emojiClass[it.emoji] ?? ""}`}>
                {it.emoji}
              </span>
              <h3 className="text-[15px] font-semibold tracking-tight">{it.name}</h3>
            </div>
            {it.line && (
              <p className="mt-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
                {it.line}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

Cards are `<div>`, not links: they go nowhere, so they must not look clickable. No `hover:bg`, no `group-hover:underline`, no pointer cursor. The `toy-card` lift and emoji animation stay as play, not affordance.

- [ ] **Step 2: Replace the homepage right column in `app/page.tsx`**

Imports: drop `ProjectCards`, `TinyshipManifesto`, `ShipLedger`. Add:

```tsx
import Link from "next/link";
import { InterestCards } from "@/components/InterestCards";
import { nowPage, beliefs } from "@/lib/site"; // merge into the existing site import
```

Right column body becomes:

```tsx
<div className="flex flex-col gap-14">
  <InterestCards />

  {/* Now teaser: the first three items of the now page. */}
  {nowPage.items.length > 0 && (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        Now
      </h2>
      <ul className="flex flex-col">
        {nowPage.items.slice(0, 3).map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 border-t border-black/[0.06] py-3 text-sm first:border-t-0 dark:border-white/[0.08]"
          >
            <span className="leading-none">{item.emoji}</span>
            <span className="text-black/80 dark:text-white/80">{item.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/now"
        className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
      >
        More on the now page
      </Link>
    </section>
  )}

  {/* Beliefs: renders nothing until the list has content. */}
  {beliefs.length > 0 && (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
        Things I believe
      </h2>
      <ul className="flex flex-col gap-3">
        {beliefs.map((b, i) => (
          <li key={i} className="leading-relaxed text-black/80 dark:text-white/80">
            {b}
          </li>
        ))}
      </ul>
    </section>
  )}

  {/* The one door to the wall. Recency shows only when it is fresh. */}
  <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
    I also build a lot of small products. {cadence.total} ships
    {cadence.freshLabel
      ? cadence.freshLabel === "shipped today"
        ? ", the last one today"
        : `, the last one ${cadence.freshLabel}`
      : ""}
    .{" "}
    <Link
      href="/ships"
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
    >
      See the wall
    </Link>
  </p>
</div>
```

Left column JSX is unchanged; it picks up the new copy from `lib/site.ts`. `nowMs` is no longer needed in this file; keep `const cadence = shipCadence(shipped.map((s) => s.date), Date.now());`.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: build passes. Then check both modes:

- `npm run dev`: the first four interest cards show dashed `photo-<id>` placeholders.
- `npx next start`: no placeholder boxes anywhere. `curl -s localhost:4010 | grep -c "dev only"` prints `0`.
- With today's stale ledger, the ships line reads "I also build a lot of small products. 52 ships. See the wall".

- [ ] **Step 4: Commit and push the batch**

```bash
git add components/InterestCards.tsx app/page.tsx
git commit -m "feat: human homepage with interests, now teaser, and one door to /ships"
git push
```

---

### Task 6: Remove RSS

**Files:**
- Delete: `app/feed.xml/route.ts`, `lib/rss.ts`, `lib/rss.test.ts`
- Modify: `components/SiteFooter.tsx`

- [ ] **Step 1: Delete and unlink**

```bash
git rm -r app/feed.xml lib/rss.ts lib/rss.test.ts
```

In `components/SiteFooter.tsx`, delete the `<a href="/feed.xml" …>· RSS</a>` element.

- [ ] **Step 2: Verify**

```bash
grep -rn -iE "rss|feed\.xml" app components lib ; npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: grep prints nothing; `/feed.xml` is gone from the route list. With the server running, `curl -s -o /dev/null -w "%{http_code}" localhost:4010/feed.xml` prints `404`.

- [ ] **Step 3: Commit**

```bash
git commit -am "chore: remove the RSS feed"
```

---

### Task 7: Usability gate and visual review

No code unless the walk finds a problem. If it does, fix it, re-run the affected task's verify step, and commit.

- [ ] **Step 1: Full check**

```bash
node --test lib/cadence.test.ts && npx tsc --noEmit && npx next build 2>&1 | tail -12
```

Expected: 10 tests pass; routes are `/`, `/now`, `/ships`, plus icons.

- [ ] **Step 2: Screenshots, production mode**

Start `npx next start -p 4010`. For each of `/`, `/now`, `/ships`, capture 1440 and 400 wide full-page PNGs into `$SCRATCH` as `after-<page>-<width>.png`. Also capture `/` at 1440 from `npm run dev` as `after-home-1440-dev.png` to show the photo placeholders.

- [ ] **Step 3: Walk it as a stranger arriving from an X profile click**

Answer each in writing, with a fix or an explicit accept:

1. In five seconds on `/`, is it obvious this is a person and not a product?
2. Is there any element that looks clickable and is not, or the reverse? Check every interest card, the Now teaser, both back links.
3. Do `/`, `/now`, `/ships` link to each other with no dead ends? Does every page have a way home?
4. At 400 wide: any horizontal scroll, clipped text, or a card grid that fails to stack?
5. Production build: zero placeholder boxes, zero empty sections, no "88 days" anywhere on `/` or `/now`.
6. Dark mode: repeat checks 2 and 4 with `prefers-color-scheme: dark`.
7. Copy: no emdashes, no city, no museum name, no client name, on all three pages.

- [ ] **Step 4: Show Ben**

Build one before/after contact sheet PNG (before-home-1440 beside after-home-1440, then the `/now` and `/ships` shots, then the 400 wide row) and `open` it. Report the walk's answers and the open items from the spec: soccer team names, beliefs list, the four photos by ID, and whether dropping the old Good Robot Co description is right.

- [ ] **Step 5: Push**

```bash
git push
```
