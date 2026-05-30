# 0xben.com — Roadmap

**Goal:** shipping momentum. The primary "user" is Ben; the conversion being
optimized is *shipping again*. The site is an anti-procrastination wall.

## The funnel (momentum loop)

```
Ship → Capture (log it) → See (visible cadence) → Feel (reward) → Stay accountable → Repeat
```

Three levers actually drive the habit: **make logging frictionless**, **make
progress visible**, **make NOT shipping uncomfortable**.

## Per-stage brainstorm

**① Capture — logging must be trivial**
- `npm run ship "<what>" <url>` one-command log + deploy ✅ DONE
- Auto-date entries ✅ DONE (script stamps today)
- `/ship` mobile form (auth'd) backed by a store
- **Auto-import ships** from local repos / GitHub / Vercel (see capability note below) — now high-priority

**② See — make cadence visible**
- "Shipped this month/week" count
- Ship heatmap (GitHub-style contribution calendar)
- Group ledger by month with subtotals

**③ Feel — reward the act**
- Streak counter ("3 weeks in a row")
- Milestone marks (10/25/50 ships)
- "Fresh ship" glow on entries < 7 days old

**④ Stay accountable — make silence loud**
- "Last shipped: N days ago" counter, reddens as it climbs ✅ DONE
- Auto-post new ships to X (@mostly_error)
- Weekly self-nudge email (cron: "you haven't shipped in N days")

**⑤ Repeat — close the loop**
- "Up next" public queue (pre-commitment)
- Per-project changelogs

**Cross-cutting infra:** a real ship data store (Vercel KV / Sanity / repo JSON
via GitHub API) unlocks the `/ship` form, auto-counters, streaks, and X-posting
at once. Not required to start — the `ship` script is the 80/20.

## Build order

1. ✅ `npm run ship` script — kills logging friction
2. ✅ "Last shipped: N days ago" counter — biggest nudge for least code
3. "Shipped this month" + streak — computed from existing data
4. Ship heatmap/calendar — visual gaps motivate
5. ~~Auto-post new ships to X~~ — REJECTED: Ben doesn't want commands posting to social
6. ✅ Auto-import v1 — `npm run sync` read-only weekly digest of ~/dev repos
   (commits per repo + new-repo flags). Future: auto-draft ledger entries.

**Cut/deferred:** milestone badges, RSS/subscribe (audience features — goal is
momentum, not awareness yet); `/ship` mobile form (only if the script still
doesn't get used).

## Posting = shipping (built 2026-05-29)

Final model (after exploring account-recency, then rejecting it): **a post is
just a ship.** "Posted 3 editorial tweets" is a ledger entry like any other —
it counts toward the total, bumps "last shipped", and is the action you want
to reinforce. No account directory, no follower counts, no recency-per-account.

- ✅ Optional `tag` on shipped entries → small chip ("post"/"wrote"/"build"/
  "launch") so the ledger reads as a typed activity log.
- ✅ `npm run post -- "Posted 3 editorial tweets"` (alias for `ship --tag=post`).

## One-command tooling (built 2026-05-29)

The whole point is zero friction — if logging has any cost, it won't happen.
- ✅ `npm run ship -- "<what>" [url] [--tag=post]` → log + commit + deploy
- ✅ `npm run post -- "<what>" [url]` → tagged-post ship
- ✅ `npm run project -- "Name" url "desc" [--emoji= --metric= --value=]` →
  registers a project AND auto-logs a "Launched <name>" ship, then deploys
  (`--no-ship`, `--no-deploy`, `--dry` available)

Follow-ups: per-type counts ("3 posts this week"). (Auto-post to X: rejected —
no auto-posting to social.)

## Capability note — can the ledger auto-populate?

A sweep on 2026-05-29 showed what's machine-visible:

| Dimension | Source | Visible? |
|-----------|--------|----------|
| **Built (code)** | ~27 local git repos in `~/dev` + GitHub public events (`mostlyerror`) + Vercel deploys (CLI) | ✅ Strong — precise dates, per-repo |
| **Wrote** | repos (`learnings`, `knowledge-base`, `ideas`), goodrobotco Sanity CMS | 🟡 Partial — if it lives in a repo or CMS |
| **Posted (X)** | x.com/mostly_error | 🔴 Weak — needs X API/paid; not freely readable |
| **Sent (email)** | Gmail (MCP) | 🟡 Possible with auth; broad/private |
| **Engaged (analytics)** | PostHog (MCP) | 🟡 If products emit events |

Implication: a `npm run ship:sync` that drafts ship entries from **local repo
activity + GitHub events + Vercel deploys** is very doable and would surface the
*dozens* of repos shipping that the site doesn't show. Manual approval keeps the
"I shipped this" dopamine. X/email/engagement remain manual or need extra auth.
