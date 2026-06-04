import type { CSSProperties } from "react";
import { site, socials, projects, manualStats, inlineLinks, shipped, status, now as nowLine, tinyship, growth } from "@/lib/site";
import { ShipHeatmap } from "@/components/ShipHeatmap";
import { Sparkline } from "@/components/Sparkline";
import { StatusLine } from "@/components/StatusLine";
import { SocialIcons } from "@/components/SocialIcons";
import { ClickableAvatar } from "@/components/ClickableAvatar";
import { FooterRotator } from "@/components/FooterRotator";

// Per-project emoji hover personality (see globals.css). Keys must match the
// emoji literals in lib/site.ts exactly, including any U+FE0F variation selector
// on 🌦️ / 🍽️ / 🌡️. Unmapped emoji fall back to the base .toy-emoji pop.
const emojiClass: Record<string, string> = {
  "🏓": "emoji-pickle",
  "🌦️": "emoji-rain",
  "📈": "emoji-chart",
  "💌": "emoji-letter",
  "📞": "emoji-phone",
  "🌐": "emoji-globe",
  "🍽️": "emoji-plate",
  "🌡️": "emoji-temp",
};

// Server component: GitHub stats are fetched here (cached 1h) so the
// page arrives fully rendered with no client-side loading flash.
export default async function Home() {
  // Prominent stat cards — your real, current numbers. GitHub is handled
  // separately as a de-emphasized footnote (see below).
  const cards = [
    ...socials
      .filter((s) => s.followers != null)
      .map((s) => ({ label: `${s.label} followers`, value: s.followers!.toLocaleString() })),
    ...manualStats
      .filter((s) => s.value != null)
      .map((s) => ({ label: s.label, value: s.value! })),
  ];

  // Freshness nudge: how long since the newest ship. The longer the
  // silence, the redder it gets — make not-shipping uncomfortable.
  const lastShipDate = new Date(shipped[0]?.date ?? "");
  const daysSinceShip = Number.isNaN(lastShipDate.getTime())
    ? null
    : Math.max(0, Math.floor((Date.now() - lastShipDate.getTime()) / 86_400_000));
  const lastShipLabel =
    daysSinceShip == null
      ? null
      : daysSinceShip === 0
        ? "shipped today"
        : daysSinceShip === 1
          ? "1 day ago"
          : `${daysSinceShip} days ago`;
  const lastShipColor =
    daysSinceShip == null
      ? ""
      : daysSinceShip <= 3
        ? "text-emerald-600 dark:text-emerald-400"
        : daysSinceShip <= 10
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  // Cadence stats, all derived from the ledger dates.
  const shipDates = shipped
    .map((s) => new Date(s.date))
    .filter((d) => !Number.isNaN(d.getTime()));
  const now = new Date();
  const shipsThisMonth = shipDates.filter(
    (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(),
  ).length;
  const weekStreak = computeWeekStreak(shipDates);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
      <div className="flex flex-1 flex-col gap-14 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-14 lg:sticky lg:top-16">
      {/* Hero */}
      <section className="toy-hero flex flex-col gap-4">
        <ClickableAvatar
          src={site.avatar}
          alt={site.name}
          size={112}
          className="toy-avatar size-24 rounded-full object-cover ring-1 ring-black/10 sm:size-28 dark:ring-white/15"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <WavingHeadline text={site.headline} />
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60">
          {site.tagline}
        </p>
        <StatusLine items={status} />
        <SocialIcons />
        {nowLine && (
          <p className="mt-1 flex items-baseline gap-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
            <span className="metric-fresh mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                Now
              </span>
              {nowLine.replace(/^Right now:\s*/i, "")}
            </span>
          </p>
        )}
      </section>

      {/* Bio */}
      <section className="flex flex-col gap-4 leading-relaxed text-black/80 dark:text-white/80">
        {site.bio.map((p, i) => (
          <p key={i}>
            <Linkified text={p} />
          </p>
        ))}
      </section>
        </div>

        {/* RIGHT — shipping activity */}
        <div className="flex flex-col gap-14">
      {/* Projects */}
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
          What I'm building
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p, i) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ "--i": i } as CSSProperties}
              className="toy-card rise group flex flex-col rounded-xl border border-black/[0.08] p-5 transition-colors hover:border-black/15 hover:bg-black/[0.015] dark:border-white/[0.08] dark:hover:border-white/20 dark:hover:bg-white/[0.02]"
            >
              {/* Header row: name as the lead, emoji a quiet glyph that pops on hover.
                  A fresh project (real activity in the last 3 days) gets a live dot —
                  the earned pulse, honest because it only fires when something happened. */}
              <div className="flex items-center gap-2.5">
                <span className={`toy-emoji text-lg leading-none ${emojiClass[p.emoji] ?? ""}`}>{p.emoji}</span>
                <h3 className="text-[15px] font-semibold tracking-tight group-hover:underline">
                  {p.name}
                </h3>
                {isFresh(p) && (
                  <span
                    title="Active in the last few days"
                    className="metric-fresh ml-auto size-1.5 shrink-0 rounded-full bg-emerald-500"
                  />
                )}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-black/55 dark:text-white/55">
                {p.description}
              </p>

              {/* Instrument readout: metrics as labeled rows on hairline
                  dividers, mono numerals — precise, not boastful. Cockpit. */}
              <div className="mt-4 flex flex-col">
                <HeadlineMetric project={p} />
                <ProjectGrowth project={p} />
                {p.traffic && p.traffic.length >= 2 && (
                  <div className="flex items-center justify-between border-t border-black/[0.06] py-2 dark:border-white/[0.07]">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-black/35 dark:text-white/35">
                      visitors / wk
                    </span>
                    <Sparkline data={p.traffic} className="h-4 w-16" />
                  </div>
                )}
              </div>

              {/* Footer: distribution channels + status + PH credential, quiet. */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
                <ProjectChannels project={p} />
                <ProjectDistribution projectName={p.name} />
                {p.phPostId && <ProductHuntChip project={p} />}
              </div>
            </a>
          ))}
        </div>

        {/* TinyShip manifesto */}
        <div className="mt-1 flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
            <span className="font-semibold text-black dark:text-white">
              🚀 {tinyship.wordmark}
            </span>{" "}
            {tinyship.manifesto}
          </p>
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
        </div>
      </section>

      {/* The Gap — confront built-but-unshown BEFORE the trophy ledger. */}
      <ShippingGap />

      {/* Shipped — the proof-of-shipping ledger */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
              Shipped
              <span className="badge badge-sm badge-ghost normal-case tracking-normal">
                🚀 {tinyship.wordmark}
              </span>
            </h2>
            {lastShipLabel && (
              <span className={`text-sm tabular-nums ${lastShipColor}`}>
                {lastShipLabel}
              </span>
            )}
          </div>
          <p className="text-xs tabular-nums text-black/40 dark:text-white/40">
            {shipsThisMonth} this month
            {weekStreak > 0 && (
              <>
                {" · "}
                <span className="flame">🔥</span> {weekStreak}-week streak
              </>
            )}
            {` · ${shipped.length} total`}
          </p>
        </div>

        <ShipHeatmap entries={shipped} nowMs={now.getTime()} />

        <ol className="max-h-[26rem] overflow-y-auto pr-2 sm:columns-2 sm:gap-x-8">
          {shipped.map((s, i) => (
            <li
              key={i}
              className="break-inside-avoid border-t border-black/[0.06] first:border-t-0 dark:border-white/[0.08]"
            >
              {s.details && s.details.length > 0 ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="w-24 shrink-0 text-sm tabular-nums text-black/40 dark:text-white/40">
                      {s.date}
                    </span>
                    <span className="flex-1 text-sm text-black/80 dark:text-white/80">
                      {s.tag && <Tag label={s.tag} />}
                      {s.what}
                      <span className="ml-1.5 inline-block text-black/30 transition-transform group-open:rotate-90 dark:text-white/30">
                        ›
                      </span>
                    </span>
                  </summary>
                  <div className="flex gap-4 pb-3">
                    <span className="w-24 shrink-0" />
                    <div className="flex-1">
                      {s.href && (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-black/60 underline-offset-2 hover:underline dark:text-white/60"
                        >
                          {s.href.replace(/^https?:\/\//, "")} ↗
                        </a>
                      )}
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-black/60 dark:text-white/60">
                        {s.details.map((d, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-black/30 dark:text-white/30">–</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              ) : (
                <div className="flex gap-4 py-3">
                  <span className="w-24 shrink-0 text-sm tabular-nums text-black/40 dark:text-white/40">
                    {s.date}
                  </span>
                  <span className="flex-1 text-sm text-black/80 dark:text-white/80">
                    {s.tag && <Tag label={s.tag} />}
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {s.what} ↗
                      </a>
                    ) : (
                      s.what
                    )}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Stats — only shown when there are real numbers to show */}
      {cards.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            The numbers
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cards.map((c) => (
              <StatCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </section>
      )}
        </div>
      </div>

      <footer className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-sm text-black/40 dark:text-white/40">
        <span>
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </span>
        <BuildStamp />
        {daysSinceShip != null && (
          <span title="Newest entry on the shipping wall">
            ·{" "}
            {daysSinceShip === 0
              ? "last shipped today"
              : daysSinceShip === 1
                ? "last shipped 1d ago"
                : `last shipped ${daysSinceShip}d ago`}
          </span>
        )}
        <span className="w-full" />
        <FooterRotator />
      </footer>
    </main>
  );
}

// Splits a string on any phrase in `inlineLinks` and renders those
// phrases as links, leaving the rest as plain text.
function Linkified({ text }: { text: string }) {
  const phrases = Object.keys(inlineLinks);
  if (phrases.length === 0) return <>{text}</>;

  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));

  return (
    <>
      {parts.map((part, i) =>
        inlineLinks[part] ? (
          <a
            key={i}
            href={inlineLinks[part]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

// Consecutive 7-day windows (back from today) that each contain a ship.
function computeWeekStreak(dates: Date[]): number {
  const DAY = 86_400_000;
  const now = Date.now();
  let streak = 0;
  for (let w = 0; w < 520; w++) {
    const end = now - w * 7 * DAY;
    const start = end - 7 * DAY;
    if (!dates.some((d) => d.getTime() > start && d.getTime() <= end)) break;
    streak++;
  }
  return streak;
}

// ── The Gap: built vs shown ──────────────────────────────────────────────
// Anti-avoidance, not celebration. A commit/build feels like progress, but a
// thing nobody has seen isn't shipped. This confronts the wall with its own
// limbo: projects that exist but aren't being put in front of anyone.
// "Shown" = a logged distribution (post) OR an active ongoing channel (daily
// IG, ongoing tweeting). Channels capture CONTINUOUS distribution without
// forcing a log of every single post. All real — nothing fabricated.
const KILL_OR_SHIP_DAYS = 7;

type GapItem = {
  name: string;
  shown: boolean; // logged a post OR has an active distribution channel
  posts: number; // logged one-off distribution actions
  channel: string | null; // ongoing channel summary, e.g. "Instagram · daily"
  builtDaysAgo: number | null; // since first ledger activity for this project
  overdue: boolean; // built, unshown, past the kill-or-ship window
};

function analyzeGap(): { items: GapItem[]; built: number; shown: number } {
  const items: GapItem[] = [];
  for (const proj of projects) {
    const entries = shipped.filter((s) => s.project === proj.name);
    const dates = entries
      .map((e) => daysAgo(e.date))
      .filter((d): d is number => d != null);
    const builtDaysAgo = dates.length ? Math.max(...dates) : null;
    const posts = entries.filter((e) => e.tag === "post").length;
    const ch = proj.channels?.[0];
    const channel = ch ? `${ch.label}${ch.cadence ? ` · ${ch.cadence}` : ""}` : null;
    // Shown if you've logged a post OR you're actively distributing on a channel.
    const shown = posts > 0 || channel != null;
    const overdue = !shown && (builtDaysAgo ?? 0) >= KILL_OR_SHIP_DAYS;
    items.push({ name: proj.name, shown, posts, channel, builtDaysAgo, overdue });
  }
  const built = items.length;
  const shown = items.filter((i) => i.shown).length;
  // Worst first: overdue, then unshown, then by least distribution.
  items.sort(
    (a, b) =>
      Number(b.overdue) - Number(a.overdue) ||
      Number(a.shown) - Number(b.shown) ||
      a.posts - b.posts,
  );
  return { items, built, shown };
}

// Days since the most recent REAL launch (a shipped entry tagged "launch").
// This is the slow-burn counter for the Gap board: posts and builds don't
// reset it, only actually putting a new thing into the world does. Returns
// null if there's never been a launch logged.
function daysSinceLaunch(): number | null {
  const launchDays = shipped
    .filter((s) => s.tag === "launch")
    .map((s) => daysAgo(s.date))
    .filter((d): d is number => d != null);
  return launchDays.length ? Math.min(...launchDays) : null;
}

// Launch-freshness color: a real launch earns a longer green glow than a
// single ship (launches are rare), then ambers, then reddens as it ages.
function launchColor(days: number): string {
  return days <= 14
    ? "text-emerald-600 dark:text-emerald-400"
    : days <= 30
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
}

// Consecutive 7-day windows (back from today) each containing a DISTRIBUTION
// act (a "post" ship). This is the streak that can't be faked by coding,
// it only advances when you put something in front of people.
function distributionStreak(): number {
  const DAY = 86_400_000;
  const now = Date.now();
  const postDates = shipped
    .filter((s) => s.tag === "post")
    .map((s) => new Date(s.date).getTime())
    .filter((t) => !Number.isNaN(t));
  let streak = 0;
  for (let w = 0; w < 520; w++) {
    const end = now - w * 7 * DAY;
    const start = end - 7 * DAY;
    if (!postDates.some((t) => t > start && t <= end)) break;
    streak++;
  }
  return streak;
}

// Recency helpers for per-project distribution freshness.
function daysAgo(dateStr: string): number | null {
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? null : Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function agoLabel(days: number): string {
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

function freshnessColor(days: number): string {
  return days <= 7
    ? "text-emerald-600 dark:text-emerald-400"
    : days <= 21
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
}

// The Gap board — the anti-avoidance heart of the wall. Confronts you with
// what you've BUILT but never SHOWN anyone. Loss-framed on purpose: a quiet
// trophy log lets you avoid; a board that says "3 built, 1 shown" does not.
function ShippingGap() {
  const { items, built, shown } = analyzeGap();
  const streak = distributionStreak();
  const unshown = items.filter((i) => !i.shown);
  const overdue = items.filter((i) => i.overdue);
  const sinceLaunch = daysSinceLaunch();
  const launchLabel =
    sinceLaunch == null
      ? null
      : sinceLaunch === 0
        ? "launched today"
        : sinceLaunch === 1
          ? "1 day since a real launch"
          : `${sinceLaunch} days since a real launch`;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-black/[0.08] bg-black/[0.015] p-5 dark:border-white/[0.08] dark:bg-white/[0.02]">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            The Gap
          </h2>
          <span className="text-xs text-black/40 dark:text-white/40">built ≠ shipped</span>
        </div>
        {/* The headline number that should sting. */}
        <p className="text-[15px] font-semibold tracking-tight">
          <span className="tabular-nums">{built}</span> built ·{" "}
          <span
            className={
              shown < built
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }
          >
            <span className="tabular-nums">{shown}</span> shown to anyone
          </span>
        </p>
        {launchLabel && (
          <p className="text-xs font-medium tabular-nums">
            <span className={sinceLaunch === 0 ? "text-emerald-600 dark:text-emerald-400" : launchColor(sinceLaunch!)}>
              {launchLabel}
            </span>
          </p>
        )}
        <p className="text-xs text-black/45 dark:text-white/45">
          A commit is you talking to yourself. Shipping is when someone else sees it.
          {streak > 0 ? (
            <>
              {" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                <span className="flame">🔥</span> {streak}-week distribution streak
              </span>{" "}
              so keep reaching people.
            </>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              {" "}
              No distribution this week. The streak is at 0.
            </span>
          )}
        </p>
      </div>

      {/* Kill-or-ship: anything built and unshown past the window. */}
      {overdue.length > 0 && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/[0.05] px-3.5 py-3">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            Ship it or kill it
          </p>
          <p className="mt-1 text-xs text-black/55 dark:text-white/55">
            {overdue.map((i, n) => (
              <span key={i.name}>
                {n > 0 && ", "}
                <span className="font-medium text-black/75 dark:text-white/75">{i.name}</span>
                {i.builtDaysAgo != null && (
                  <span className="text-black/40 dark:text-white/40">
                    {" "}
                    ({i.builtDaysAgo}d, nobody's seen it)
                  </span>
                )}
              </span>
            ))}
            . Put it in front of people, or park it. No silent limbo.
          </p>
        </div>
      )}

      {/* The honest list: who's been shown, who hasn't. */}
      <ul className="flex flex-col">
        {items.map((i) => (
          <li
            key={i.name}
            className="flex items-center justify-between gap-2 border-t border-black/[0.06] py-2 text-sm first:border-t-0 dark:border-white/[0.07]"
          >
            <span className="flex items-center gap-2">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  i.shown ? "bg-emerald-500" : i.overdue ? "bg-red-500" : "bg-black/20 dark:bg-white/20"
                }`}
              />
              <span className={i.shown ? "" : "text-black/70 dark:text-white/70"}>{i.name}</span>
            </span>
            <span className="text-xs">
              {i.shown ? (
                <span className="text-black/45 dark:text-white/45">
                  {i.channel
                    ? i.channel
                    : `${i.posts} ${i.posts === 1 ? "post" : "posts"}`}
                </span>
              ) : (
                <span className={i.overdue ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}>
                  not shown
                  {i.builtDaysAgo != null ? ` · ${i.builtDaysAgo}d` : ""}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {unshown.length > 0 && (
        <p className="text-xs text-black/40 dark:text-white/40">
          {unshown.length} {unshown.length === 1 ? "project is" : "projects are"} built but
          invisible. The fix isn&apos;t more code, it&apos;s one post.
        </p>
      )}
    </section>
  );
}

// Distribution effort for a project, rolled up from the ledger's "post"
// entries. "not promoted yet" is the nudge for built-but-unshared projects.
function ProjectDistribution({ projectName }: { projectName: string }) {
  const posts = shipped.filter((s) => s.project === projectName && s.tag === "post");
  if (posts.length === 0) {
    return <span className="text-[11px] text-black/30 dark:text-white/30">not promoted yet</span>;
  }
  const days = daysAgo(posts[0].date);
  return (
    <span className="text-[11px] text-black/40 dark:text-white/40">
      <span className="tabular-nums">{posts.length}</span> {posts.length === 1 ? "post" : "posts"}
      {days != null && (
        <>
          {" · "}
          <span className={freshnessColor(days)}>promoted {agoLabel(days)}</span>
        </>
      )}
    </span>
  );
}

// Turn an irregularly-logged series of cumulative totals into an honest view.
// Totals only ever climb, and you log only when a number changes, so a chart
// of the total is a meaningless staircase. Instead:
//   - delta = change since your PREVIOUS logged value (no fake "this week"
//     time claim — just the true move between two real check-ins)
//   - rate = new-per-week, bucketed with carry-forward (flat weeks read as 0),
//     shown as a sparkline only once there's enough history to mean something.
function growthView(series: { date: string; value: number }[]) {
  const pts = series
    .map((p) => ({ t: new Date(p.date).getTime(), v: p.value }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
  if (pts.length === 0) return null;

  const latest = pts[pts.length - 1].v;
  // Delta vs the previous logged point. Undefined with only one point —
  // we genuinely don't know the change yet, so we won't invent one.
  const delta = pts.length >= 2 ? latest - pts[pts.length - 2].v : null;

  // Weekly carry-forward totals from first log to now, then diff → per-week rate.
  const WEEK = 7 * 86_400_000;
  const rate: number[] = [];
  let pi = 0;
  let carried = pts[0].v;
  let prev = pts[0].v;
  for (let w = pts[0].t; w <= Date.now() + WEEK; w += WEEK) {
    while (pi < pts.length && pts[pi].t < w + WEEK) carried = pts[pi++].v;
    rate.push(carried - prev);
    prev = carried;
  }
  const weeklyRate = rate.slice(1); // drop the seed week (always 0)
  // Only chart once there's real history with at least one non-flat week.
  const showChart = weeklyRate.length >= 6 && weeklyRate.some((r) => r > 0);

  return { latest, delta, weeklyRate, showChart };
}

// Wraps any emoji in the headline so it waves on its own — the signature toy.
// Splits on the wave-able glyphs and animates just those, leaving text still.
function WavingHeadline({ text }: { text: string }) {
  const parts = text.split(/(👋)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "👋" ? (
          <span key={i} className="wave">
            👋
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

type Project = (typeof projects)[number];

// A project is "fresh" if it had real activity in the last 3 days — a recent
// ledger entry OR a logged growth gain. Drives the earned pulse: a card only
// comes alive when the world actually responded, never as idle decoration.
function isFresh(p: Project): boolean {
  const FRESH_DAYS = 3;
  const recentShip = shipped.some(
    (s) => s.project === p.name && (daysAgo(s.date) ?? 99) <= FRESH_DAYS,
  );
  if (recentShip) return true;
  return growth.some((g) => {
    if (g.project !== p.name || g.series.length < 2) return false;
    const last = g.series[g.series.length - 1];
    const gained = last.value > g.series[g.series.length - 2].value;
    return gained && (daysAgo(last.date) ?? 99) <= FRESH_DAYS;
  });
}

// Small "Featured on Product Hunt" chip in the card's own styling — a quiet
// credential, not a loud sticker. Non-interactive (the whole card already
// links out), so it stays valid inside the card's outer <a> and renders
// server-side. PH's brand coral, dialed down to chip weight.
function ProductHuntChip({ project: p }: { project: Project }) {
  return (
    <span className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-[#da552f]/30 bg-[#da552f]/[0.06] px-2 py-0.5 text-[10px] font-medium text-[#da552f] dark:border-[#ff6154]/30 dark:bg-[#ff6154]/10 dark:text-[#ff6154]">
      <span className="font-bold">P</span>
      <span className="uppercase tracking-wide">Featured on PH</span>
      {p.phUpvotes != null && (
        <span className="tabular-nums opacity-80">▲ {p.phUpvotes}</span>
      )}
    </span>
  );
}

// Distribution channels as quiet emerald chips on the card. Channels mean
// ACTIVE distribution, so they earn the accent color. Each chip shows
// `label · cadence` (cadence optional). The whole card is already an <a>, so a
// nested interactive <a> would be invalid HTML; channels render as plain
// non-interactive <span> chips even when channel.href exists. Renders nothing
// when there are no channels, keeping unhustled projects honest.
function ProjectChannels({ project: p }: { project: Project }) {
  if (!p.channels || p.channels.length === 0) return null;
  return (
    <>
      {p.channels.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-400"
        >
          <span>{c.label}</span>
          {c.cadence && (
            <span className="text-emerald-700/60 dark:text-emerald-400/60">· {c.cadence}</span>
          )}
        </span>
      ))}
    </>
  );
}

// A growth line is the card's "headline" metric when its label matches the
// project's metricLabel (e.g. Raincheck's "users" line == its headline number).
// That single source of truth means logging `tinyship growth raincheck 6`
// updates the big number top-right, and we never print it twice.
function headlineLine(p: Project) {
  return growth.find(
    (g) =>
      g.project === p.name &&
      g.series.length > 0 &&
      g.label.toLowerCase() === p.metricLabel.toLowerCase(),
  );
}

// Headline metric as an instrument readout row: label left, mono value right,
// on a hairline divider. Prefers the live logged growth value (with delta);
// falls back to the static metricValue. The label-less placeholder (a bare "—")
// stays quiet so unlaunched projects don't pretend to have a reading.
function HeadlineMetric({ project: p }: { project: Project }) {
  const line = headlineLine(p);
  const v = line ? growthView(line.series) : null;
  const value = v ? v.latest.toLocaleString() : p.metricValue;
  const labelText = p.metricLabel || (value === "—" ? "" : "—");
  return (
    <div className="flex items-baseline justify-between border-t border-black/[0.06] py-2 dark:border-white/[0.07]">
      <span className="text-[10px] uppercase tracking-[0.08em] text-black/35 dark:text-white/35">
        {labelText}
      </span>
      <span className="flex items-baseline gap-1.5 font-mono text-sm font-medium tabular-nums">
        {v && v.delta != null && v.delta > 0 && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">+{v.delta}</span>
        )}
        <span>{value}</span>
      </span>
    </div>
  );
}

// Secondary growth lines for a project (the ones NOT already shown as the
// headline metric) — e.g. noyu's engagement under its follower headline.
// Renders nothing until there's a real number, so the card stays honest.
function ProjectGrowth({ project: p }: { project: Project }) {
  const headline = headlineLine(p);
  const lines = growth.filter(
    (g) => g.project === p.name && g.series.length > 0 && g.key !== headline?.key,
  );
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((g) => {
        const v = growthView(g.series)!;
        return (
          <div
            key={g.key}
            className="flex items-center justify-between gap-2 border-t border-black/[0.06] py-2 dark:border-white/[0.07]"
          >
            <span className="text-[10px] uppercase tracking-[0.08em] text-black/35 dark:text-white/35">
              {g.label}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums">
              {v.showChart && <Sparkline data={v.weeklyRate} className="h-4 w-12" />}
              {v.delta != null && v.delta !== 0 && (
                <span
                  className={`text-[10px] ${
                    v.delta > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-black/40 dark:text-white/40"
                  }`}
                >
                  {v.delta > 0 ? `+${v.delta}` : v.delta}
                </span>
              )}
              <span>{v.latest.toLocaleString()}</span>
            </span>
          </div>
        );
      })}
    </>
  );
}

// Footer build stamp: the exact git SHA Vercel built from, so what's "live"
// is always verifiable at a glance. Links to the commit on GitHub.
function BuildStamp() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!sha) {
    return <span className="font-mono text-xs opacity-70">· dev</span>;
  }
  const short = sha.slice(0, 7);
  return (
    <a
      href={`https://github.com/${site.github}/${site.domain}/commit/${sha}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs underline-offset-2 hover:underline"
      title="Deployed commit"
    >
      · {short}
    </a>
  );
}

// Small chip marking the kind of ship (post / wrote / build / launch …).
function Tag({ label }: { label: string }) {
  return (
    <span className="badge badge-sm badge-ghost mr-2 align-middle uppercase">
      {label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-black/50 dark:text-white/50">{label}</span>
    </div>
  );
}
