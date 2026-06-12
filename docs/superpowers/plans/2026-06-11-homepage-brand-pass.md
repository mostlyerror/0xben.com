# Homepage Brand Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 0xben.com homepage serve strangers (brand) as well as Ben (motivation): remove public shame states, add three layered conversion doors, pin highlights, and gloss the ledger.

**Architecture:** All content stays data-driven from `lib/site.ts`; `app/page.tsx` renders it. The only new module is a pure RSS builder (`lib/rss.ts`) consumed by a static route handler at `app/feed.xml/route.ts`. No new services, no env vars, `infra.yaml` untouched.

**Tech Stack:** Next.js 16 App Router (static prerender), Tailwind v4, TypeScript. Tests: Node's built-in `node --test` (Node 25 runs `.ts` directly). There is no other test infra in this repo; UI changes are verified by `npm run build` plus visual check.

**Spec:** `docs/superpowers/specs/2026-06-11-homepage-brand-pass-design.md`

**Copy rules (apply to every string written in this plan's code):** plain human voice, NO emdashes.

---

## File Structure

- Modify: `lib/site.ts` — remove `manualStats`; add `gloss?`/`featured?` to the `shipped` type; backfill gloss + featured entries; add `workWithMe` export
- Modify: `app/page.tsx` — remove cockpit elements; add doors, highlights, gloss rendering
- Create: `lib/rss.ts` — pure RSS 2.0 builder + XML escaping (no Next/alias imports, so Node can test it directly)
- Create: `lib/rss.test.ts` — node:test coverage for escaping and feed shape
- Create: `app/feed.xml/route.ts` — static route handler serving the feed

---

### Task 1: Cockpit subtractions

Remove public shame states and the dead stat-card section.

**Files:**
- Modify: `app/page.tsx`
- Modify: `lib/site.ts`

- [ ] **Step 1: Remove the `ProjectDistribution` component and its usage**

In `app/page.tsx`, delete the whole `ProjectDistribution` function (the block starting with the comment `// Distribution effort for a project, rolled up from the ledger's "post"` down through its closing brace, currently lines ~403-422).

Then in the project-card footer (inside the `projects.map`), delete this line:

```tsx
                <ProjectDistribution projectName={p.name} />
```

Keep `<ProjectChannels project={p} />` and the Product Hunt chip; those stay per spec.

- [ ] **Step 2: Neutralize the "last shipped" color**

In `app/page.tsx`, delete the `lastShipColor` const (the ternary block assigning emerald/amber/red, currently lines ~52-59). Then change its one usage:

```tsx
            {lastShipLabel && (
              <span className={`text-sm tabular-nums ${lastShipColor}`}>
                {lastShipLabel}
              </span>
            )}
```

to:

```tsx
            {lastShipLabel && (
              <span className="text-sm tabular-nums text-black/40 dark:text-white/40">
                {lastShipLabel}
              </span>
            )}
```

- [ ] **Step 3: Remove the stat-card section (already renders nothing)**

In `app/page.tsx`:

1. Delete the `cards` const (the block starting `const cards = [` through `];`, currently lines ~29-36).
2. Delete the whole `{/* Stats — only shown when there are real numbers to show */}` section (the `{cards.length > 0 && ( <section> ... </section> )}` block).
3. Delete the `StatCard` function at the bottom of the file.
4. In the import on line 2, remove `manualStats` from the import list.

- [ ] **Step 4: Remove `manualStats` from `lib/site.ts`**

Delete this block (nothing else references it; verified scripts/ and components/ are clean):

```ts
export const manualStats: { label: string; value: string | null }[] = [
  { label: "Monthly visitors", value: null },
  { label: "Total revenue", value: null },
];
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds, all routes static.

Run: `grep -n "manualStats\|ProjectDistribution\|StatCard\|lastShipColor\|not promoted" app/page.tsx lib/site.ts`
Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx lib/site.ts
git commit -m "homepage: remove public shame states and dead stat cards

Distribution nudges live in Growthdeck; the public page keeps only
positive signals (heatmap, streak, counts, growth deltas)."
```

---

### Task 2: RSS feed (Door 3)

Pure builder with tests, a static route, and a quiet footer link.

**Files:**
- Create: `lib/rss.ts`
- Create: `lib/rss.test.ts`
- Create: `app/feed.xml/route.ts`
- Modify: `app/page.tsx` (footer link)

- [ ] **Step 1: Write the failing test**

Create `lib/rss.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { escapeXml, buildRssXml } from "./rss.ts";

test("escapeXml escapes all five XML special characters", () => {
  assert.equal(
    escapeXml(`a & b < c > d " e ' f`),
    "a &amp; b &lt; c &gt; d &quot; e &apos; f",
  );
});

test("escapeXml leaves plain text untouched", () => {
  assert.equal(escapeXml("shipped a thing"), "shipped a thing");
});

test("buildRssXml produces a valid channel with escaped items", () => {
  const xml = buildRssXml({
    title: "Ben & co",
    link: "https://0xben.com",
    description: "ships",
    entries: [
      { date: "Jun 10, 2026", what: "Launched <Growthdeck>", href: "https://growthdeck.0xben.com" },
      { date: "Jun 9, 2026", what: "No link entry" },
    ],
  });
  assert.ok(xml.startsWith(`<?xml version="1.0" encoding="UTF-8"?>`));
  assert.match(xml, /<title>Ben &amp; co<\/title>/);
  assert.match(xml, /<title>Launched &lt;Growthdeck&gt;<\/title>/);
  // Entry without href falls back to the site link.
  assert.equal(xml.match(/<link>https:\/\/0xben\.com<\/link>/g)?.length, 2);
  // RFC822-style date from "Jun 10, 2026".
  assert.match(xml, /<pubDate>Wed, 10 Jun 2026/);
});

test("buildRssXml prefers the gloss as the item title", () => {
  const xml = buildRssXml({
    title: "t",
    link: "https://0xben.com",
    description: "d",
    entries: [{ date: "Jun 1, 2026", what: "raw log line", gloss: "plain language line" }],
  });
  assert.match(xml, /<title>plain language line<\/title>/);
  assert.doesNotMatch(xml, /raw log line/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/rss.test.ts`
Expected: FAIL, cannot find module `./rss.ts`.

- [ ] **Step 3: Implement `lib/rss.ts`**

Keep it dependency-free (no `@/` imports) so Node can run the test directly:

```ts
// Minimal RSS 2.0 builder for the shipped ledger. Pure functions only:
// no Next.js or path-alias imports, so `node --test lib/rss.test.ts` works.

export type FeedEntry = {
  date: string; // "Jun 10, 2026" style, as logged in lib/site.ts
  what: string;
  href?: string;
  gloss?: string;
};

export function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildRssXml(opts: {
  title: string;
  link: string;
  description: string;
  entries: FeedEntry[];
}): string {
  const items = opts.entries
    .map((e) => {
      const title = escapeXml(e.gloss ?? e.what);
      const link = escapeXml(e.href ?? opts.link);
      const pubDate = new Date(e.date).toUTCString();
      return [
        "    <item>",
        `      <title>${title}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="false">${escapeXml(`${e.date}:${e.what}`)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    "  <channel>",
    `    <title>${escapeXml(opts.title)}</title>`,
    `    <link>${escapeXml(opts.link)}</link>`,
    `    <description>${escapeXml(opts.description)}</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test lib/rss.test.ts`
Expected: 4 passing.

- [ ] **Step 5: Create the route handler**

Create `app/feed.xml/route.ts`:

```ts
import { site, shipped } from "@/lib/site";
import { buildRssXml } from "@/lib/rss";

// The ledger is static data baked at build time, so the feed is too.
export const dynamic = "force-static";

export function GET() {
  const xml = buildRssXml({
    title: `${site.domain} shipping log`,
    link: site.url,
    description: "Everything Ben ships, newest first.",
    entries: shipped,
  });
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 6: Add the footer RSS link**

In `app/page.tsx`, in the footer, directly after `<BuildStamp />`, add:

```tsx
        <a
          href="/feed.xml"
          className="underline-offset-2 hover:underline"
          title="RSS feed of the shipping log"
        >
          · RSS
        </a>
```

- [ ] **Step 7: Verify the feed builds and parses**

Run: `npm run build`
Expected: build succeeds and the route list includes `○ /feed.xml` (static).

Run: `npm run dev` in the background, then `curl -s http://localhost:3000/feed.xml | head -20`
Expected: XML starting with `<?xml version="1.0"` and `<title>0xben.com shipping log</title>`, items newest-first. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
git add lib/rss.ts lib/rss.test.ts app/feed.xml/route.ts app/page.tsx
git commit -m "feat: RSS feed of the shipping log at /feed.xml (door 3: subscribe)"
```

---

### Task 3: Work-with-me line (Door 1)

**Files:**
- Modify: `lib/site.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the copy to `lib/site.ts`**

Directly below the `inlineLinks` export, add:

```ts
// ── Door 1: work with me. One quiet line, no services page. ──
export const workWithMe = {
  lead: "I also help vibe coders turn prototypes into shipped products.",
  cta: "Email me",
  href: "mailto:benjamintpoon@gmail.com",
};
```

- [ ] **Step 2: Render it at the end of the bio**

In `app/page.tsx`, add `workWithMe` to the `@/lib/site` import list. Then inside the Bio section, after the `{site.bio.map(...)}` paragraphs, add:

```tsx
        <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
          {workWithMe.lead}{" "}
          <a
            href={workWithMe.href}
            className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            {workWithMe.cta}
          </a>
        </p>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add lib/site.ts app/page.tsx
git commit -m "feat: work-with-me line at the end of the bio (door 1: consulting)"
```

---

### Task 4: Consolidated follow line (Door 2)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove the follow link from the TinyShip manifesto box**

In `app/page.tsx`, in the TinyShip manifesto block, replace:

```tsx
          <p className="text-xs text-black/40 dark:text-white/40">
            {tinyship.seedLine}
            {tinyship.followHref && (
              <>
                {" · "}
                <a
                  href={tinyship.followHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toy-press inline-block font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  follow the build ↗
                </a>
              </>
            )}
          </p>
```

with:

```tsx
          <p className="text-xs text-black/40 dark:text-white/40">
            {tinyship.seedLine}
          </p>
```

- [ ] **Step 2: Add the follow line to the Shipped section**

Directly after `<ShipHeatmap entries={shipped} nowMs={now.getTime()} />`, add:

```tsx
        <p className="text-xs text-black/45 dark:text-white/45">
          Built in public.{" "}
          <a
            href={tinyship.followHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Follow the build on X ↗
          </a>
        </p>
```

(`tinyship` is already imported; `followHref` stays in `lib/site.ts` as the single source of the URL.)

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: success. `grep -c "follow" app/page.tsx` should show the follow CTA exists exactly once in the Shipped section.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: one follow line by the ledger, drop the duplicate in the manifesto box (door 2)"
```

---

### Task 5: Ledger gloss

**Files:**
- Modify: `lib/site.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the `gloss` field to the shipped type**

In `lib/site.ts`, in the `shipped` type, after the `details?: string[];` line, add:

```ts
  // Optional plain-language line for strangers. When set, it is what the
  // ledger shows; the raw log line moves into the expandable details.
  gloss?: string;
```

- [ ] **Step 2: Backfill gloss on the jargon-heavy recent entries**

Add a `gloss` property to these existing entries in `lib/site.ts` (match by date + start of `what`; do not change any other field):

| Entry | gloss to add |
|---|---|
| Jun 10 Growthdeck launch | `"Launched Growthdeck, a dashboard that watches distribution across all my projects and flags any channel going quiet"` |
| Jun 6 Remotion renderer | `"Built an animation renderer so noyu can iterate on auto-posted Instagram reels"` |
| Jun 1 recovery-hash | `"Shipped a safety net for password reset on PickleRadar"` |
| Jun 1 growth-tracking system | `"Built audience sparklines for this wall that chart growth rate instead of vanity totals"` |
| May 31 reply-graph (both entries) | `"Spent the day replying to builder accounts on X"` (first) and `"Replied to 10 builder accounts on X"` (second) |
| May 30 GeoToMarket autopilot | `"Built an autopilot that drafts tweet candidates for GeoToMarket three times a day and pings my phone"` |
| May 30 ClusterDesk posting engine fix | `"Fixed and rebuilt ClusterDesk's automated X posting engine and the content system around it"` |
| May 30 Hot Take | `"Built Hot Take, a bot that analyzes NYC weather markets on Kalshi and posts its picks twice a day"` |
| May 30 Carte pilot | `"Built Carte end to end: turn any restaurant's brand into a designed digital menu with a QR code. Validated on 8 real Houston restaurants."` |

- [ ] **Step 3: Render gloss in the ledger**

In `app/page.tsx`, in the `shipped.map((s, i) => ...)` list, the branch choice currently keys off `s.details`. Replace the body of the map callback so glossed entries are always expandable with the raw line first. At the top of the callback add:

```tsx
            const visible = s.gloss ?? s.what;
            const detailItems = s.gloss ? [s.what, ...(s.details ?? [])] : (s.details ?? []);
```

Then:
1. Change the branch condition from `s.details && s.details.length > 0` to `detailItems.length > 0`.
2. In both branches, replace `{s.what}` with `{visible}` (including inside the `s.href` link in the non-expandable branch).
3. In the details list, replace `s.details.map((d, j) =>` with `detailItems.map((d, j) =>`.

Note the map callback needs a block body (`{ ... return (...) }`) instead of a bare expression to hold the two consts.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: success.

Run: `npm run dev` (background), open `http://localhost:3000`, confirm: the Growthdeck entry shows the gloss, expands to reveal the raw log line. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts app/page.tsx
git commit -m "feat: ledger gloss, plain-language lines for strangers with the raw log in details"
```

---

### Task 6: Highlights strip

**Files:**
- Modify: `lib/site.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the `featured` flag to the shipped type**

In `lib/site.ts`, after the new `gloss?: string;` line, add:

```ts
  // Pin to the Highlights strip at the top of the page (keep it to 3-5).
  featured?: boolean;
```

- [ ] **Step 2: Mark the five featured entries**

Add `featured: true` to these entries:

1. Jun 10, 2026 Growthdeck launch
2. Jun 2, 2026 "PickleRadar's first signs of life"
3. May 30, 2026 Hot Take build
4. May 30, 2026 Carte pilot end-to-end
5. May 30, 2026 "Launched Raincheck on Product Hunt"

- [ ] **Step 3: Render the Highlights strip**

In `app/page.tsx`, at the top of the right column (directly above the `{/* Projects */}` section), add:

```tsx
      {/* Highlights — the first thing a stranger sees: the best recent ships. */}
      {shipped.some((s) => s.featured) && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            Highlights
          </h2>
          <ul className="flex flex-col">
            {shipped
              .filter((s) => s.featured)
              .slice(0, 5)
              .map((s) => (
                <li
                  key={`${s.date}-${s.what.slice(0, 24)}`}
                  className="flex items-baseline gap-4 border-t border-black/[0.06] py-2.5 first:border-t-0 dark:border-white/[0.08]"
                >
                  <span className="w-24 shrink-0 text-sm tabular-nums text-black/40 dark:text-white/40">
                    {s.date}
                  </span>
                  <span className="flex-1 text-sm text-black/80 dark:text-white/80">
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {s.gloss ?? s.what} ↗
                      </a>
                    ) : (
                      (s.gloss ?? s.what)
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts app/page.tsx
git commit -m "feat: highlights strip, 3-5 pinned ships a stranger sees first"
```

---

### Task 7: Final verification and ship

**Files:** none (verification only)

- [ ] **Step 1: Run the full check**

```bash
node --test lib/rss.test.ts && npm run build
```
Expected: tests pass, build succeeds, routes include `/` and `/feed.xml`.

- [ ] **Step 2: Visual before/after**

Start `npm run dev` in the background. Screenshot `http://localhost:3000` (full page, light mode is fine) and present it to Ben alongside the spec checklist:

- No "not promoted yet", no red/amber "last shipped", no stat cards
- Highlights strip at the top of the right column
- Work-with-me line under the bio, follow line by the ledger, RSS in the footer
- Glossed entries read plain; expanding reveals the raw log line
- `/feed.xml` serves valid RSS, newest first

- [ ] **Step 3: Push and log the ship**

After Ben approves the visual:

```bash
git push
```

Then log it: `npm run ship -- "Homepage brand pass: highlights strip, three quiet doors (work with me, follow, RSS), plain-language ledger glosses, and moved the accountability nudges off the public page" https://0xben.com`

(The ship script commits and deploys on its own.)
