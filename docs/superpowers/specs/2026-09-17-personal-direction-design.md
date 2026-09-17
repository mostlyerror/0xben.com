# Personal Direction: Design

**Date:** 2026-09-17
**Status:** Approved in chat, pending spec review

## Context

0xben.com is a shipping wall: a short bio, a dozen project metric cards, and
the TinyShip heatmap plus ledger. It reads as a dashboard about output. Ben
wants the site re-centered on Ben the person. Work becomes one part of it.

Decisions made in brainstorming:

- Homepage is human. The shipping wall moves to `/ships`, linked once.
- A hand-edited `/now` page. No writing or essays section yet.
- Look and feel: same bones, warmer. Keep the two-column layout, toy cards,
  emoji hover, status rotator. Change the content, not the design system.
- Consulting door stays. RSS goes.
- No location and no family on the site. The museum class is never named
  (naming it reveals the city).
- Client work is named by type only, never by client name.
- Photos come later. Ship with labeled placeholders.
- Beliefs section is parked until Ben supplies the list.

## Known risk

X profile clickers arrive to judge a builder. The homepage will no longer
prove shipping at a glance, and Ben sees his own wall less often, which
weakens the self-motivation purpose. Mitigation: the single `/ships` link
carries a live stat derived from the ledger, for example
"52 ships, last one 2 days ago".

## User journey

A stranger lands from an X profile click or a shared link.

1. Sees a face, "sup nerds", and a tagline that names a painter and a
   pickleball player before a job title. Understands this is a person.
2. Reads a four-paragraph story: 14 years of engineering, burnout, real time
   off, a return aimed at meaningful work.
3. Scans "Outside of work" cards on the right. Remembers one or two specifics
   (sold paintings in a show, singles tournaments, mahjong socials).
4. Sees what is current in the Now teaser. Can click through to `/now`.
5. Leaves through one of: email for consulting, follow on X, or the `/ships`
   link to check the building record.

## Homepage

### Left column (sticky, unchanged structure)

Avatar, headline "sup nerds 👋", tagline, status rotator, social icons, Now
line, story, work-with-me line.

Tagline:

> Software engineer, oil painter, pickleball singles player. I run Good Robot Co.

Story (`site.bio`), no emdashes, plain voice:

> I'm Ben. I've been writing software for about 14 years, most recently as a
> senior engineer at Landing, and at a handful of startups before that.
>
> Then I burned out. I took real time off. I traveled, started oil painting,
> danced a lot of salsa and bachata, did the self-awareness work, and put time
> into friends and community.
>
> I came back wanting to build things that matter. Today I run Good Robot Co,
> a one-person shop. The project I'm most excited about is custom EHR software
> for orthotics and prosthetics clinics.

Work-with-me line is unchanged: "I also help vibe coders turn prototypes into
shipped products. Email me"

"Good Robot Co" stays auto-linked via `inlineLinks`.

Status rotator lines refreshed, for example: "painting badly on purpose",
"drilling singles serves", "hosting mahjong night", "fueled by cold brew",
"probably renaming a variable". Ben edits freely.

### Right column (new content)

In order:

1. **`outside`: "Outside of work".** Cards in the existing `toy-card` style,
   same grid, emoji with hover class where one exists. New `interests` export
   in `lib/site.ts`: `{ id, emoji, name, line, photo?: string }`.
   - 🎨 Oil painting: "Sold paintings in a show. Taking a class at a museum."
   - 🏓 Pickleball: "Four times a week. Tournaments, mostly singles."
   - 🀄 Mahjong: "American and Hong Kong styles. I host socials with friends."
   - 💃 Salsa and bachata: "Social dancing."
   - ⚽ Soccer trips: "Traveling to watch my teams play." (teams unnamed
     until Ben supplies them)
   - 🏋️ Moving: "Lifting, yoga, pilates, running."
   - 🧘 Meditation
   - 🍳 Cooking
   - 📚 Reading
   The first four cards carry a photo slot. When `photo` is unset the slot
   renders a dashed placeholder box labeled with its ID and what belongs
   there, for example `photo-painting: one of your paintings`. Placeholders
   render in development only; in production an unset photo renders no slot,
   so the live site never shows empty boxes.
2. **`now-teaser`: "Now".** First three items from the `nowPage` data with a
   "more on the now page" link to `/now`.
3. **`beliefs`.** `beliefs: string[]` export, empty for now. Section renders
   nothing when empty.
4. **`ships-link`.** One line: "I also build a lot of small products.
   {N} ships, last one {label}. See the wall" linking to `/ships`. Stat is
   derived from `shipped`, same logic as today.

### Footer

Unchanged minus the RSS link. The "days since ship" footer stat stays.

## /now page

New route `app/now/page.tsx`. Same page shell, single column, narrow. Data
from a new `nowPage` export in `lib/site.ts`: `{ updated: string, items:
{ emoji, text }[] }`. Shows "Updated {date}" and a back link home.

Starting items:

- 🀄 Hosting our third mahjong social soon.
- ⚽ Barcelona and London this month to watch my favorite teams.
- 🎨 Taking an oil painting class.
- 🏔️ Booking an artist retreat in Switzerland for the spring.
- 🦿 Building custom EHR software for orthotics and prosthetics clinics.
- 🏓 Playing singles tournaments.

The existing one-line `now` export stays as the hero Now line and is
rewritten to match.

## /ships page

New route `app/ships/page.tsx`. The current homepage right column moves here
unchanged: "What I'm building" project cards, TinyShip manifesto, heatmap,
cadence stats, follow line, ledger. Adds a back link home and its own
metadata title ("Ships").

To avoid one 300-line page file becoming two, extract the moved sections and
their helpers (`HeadlineMetric`, `ProjectGrowth`, `ProjectChannels`,
`ProductHuntChip`, `Tag`, `isFresh`, cadence math) into
`components/ships/`. Cadence math (last ship label, ships this month, week
streak) becomes a pure function in `lib/cadence.ts` with unit tests, since
both the homepage link and `/ships` use it.

The `tinyship` CLI and all `npm run` scripts only write `lib/site.ts`. None
reference `app/page.tsx`. No script changes.

## Removals

- `app/feed.xml/route.ts`, `lib/rss.ts`, `lib/rss.test.ts`, footer RSS link.
- ROADMAP.md line mentioning RSS is left alone (it already lists RSS as cut).

## Metadata

`layout.tsx` builds title and description from `site.tagline` and
`site.bio[0]`. Both change with the copy, no code change needed. Replace the
" — " separator in the title with " · " to honor the no-emdash rule.

## Out of scope

- Real photos (collected from Ben later; slots are ready).
- Beliefs content.
- Essays or a writing section.
- Any visual redesign beyond content swap.
- Infra changes. No env vars or services change; `infra.yaml` untouched.

## Open items for Ben

- Soccer team names.
- Beliefs list.
- Photos for `photo-painting`, `photo-pickleball`, `photo-mahjong`,
  `photo-dance`.
- Confirm dropping the "automation for local service businesses" description
  of Good Robot Co.

## Testing and verification

- Unit tests for `lib/cadence.ts` (`node --test`).
- `next build` passes; `/`, `/now`, `/ships` render; `/feed.xml` returns 404.
- Usability walk as a stranger from X: is the person obvious in five seconds,
  is every link live, no empty boxes in production.
- Before and after screenshots of all three pages at 1440 and 400 wide,
  shown to Ben before calling it done.
