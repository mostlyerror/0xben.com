import Image from "next/image";
import { site, socials, projects, manualStats, inlineLinks, shipped, status, tinyship, growth } from "@/lib/site";
import { ShipHeatmap } from "@/components/ShipHeatmap";
import { Sparkline } from "@/components/Sparkline";
import { StatusLine } from "@/components/StatusLine";
import { SocialIcons } from "@/components/SocialIcons";

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
      <section className="flex flex-col gap-4">
        <Image
          src={site.avatar}
          alt={site.name}
          width={112}
          height={112}
          priority
          className="size-24 rounded-full object-cover ring-1 ring-black/10 sm:size-28 dark:ring-white/15"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {site.headline}
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60">
          {site.tagline}
        </p>
        <StatusLine items={status} />
        <SocialIcons />
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
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-2xl border border-black/10 p-4 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="text-right">
                  <p className="font-semibold tabular-nums leading-none">{p.metricValue}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">
                    {p.metricLabel}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold group-hover:underline">{p.name}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {p.description}
                </p>
                <ProjectDistribution projectName={p.name} />
              </div>
              <div className="mt-auto flex flex-col gap-1 pt-1">
                {p.traffic && p.traffic.length >= 2 && (
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-black/30 dark:text-white/30">
                      visitors / wk
                    </span>
                    <Sparkline data={p.traffic} className="h-5 w-20" />
                  </div>
                )}
                <ProjectGrowth projectName={p.name} />
                {p.phPostId && (
                  <>
                    {/* Theme-matched PH badge: light variant in light mode,
                        dark variant in dark mode, swapped by CSS so neither
                        looks like a sticker on the wrong background. */}
                    <img
                      src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${p.phPostId}&theme=light`}
                      alt="Featured on Product Hunt"
                      width={130}
                      height={28}
                      loading="lazy"
                      className="mt-1 block h-7 w-auto opacity-90 transition-opacity group-hover:opacity-100 dark:hidden"
                    />
                    <img
                      src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${p.phPostId}&theme=dark`}
                      alt="Featured on Product Hunt"
                      width={130}
                      height={28}
                      loading="lazy"
                      className="mt-1 hidden h-7 w-auto opacity-90 transition-opacity group-hover:opacity-100 dark:block"
                    />
                  </>
                )}
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
                  className="underline-offset-2 hover:underline"
                >
                  follow the build ↗
                </a>
              </>
            )}
          </p>
        </div>
      </section>

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
            {weekStreak > 0 && ` · 🔥 ${weekStreak}-week streak`}
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

// Distribution effort for a project, rolled up from the ledger's "post"
// entries. "not promoted yet" is the nudge for built-but-unshared projects.
function ProjectDistribution({ projectName }: { projectName: string }) {
  const posts = shipped.filter((s) => s.project === projectName && s.tag === "post");
  if (posts.length === 0) {
    return <p className="mt-1 text-xs text-black/30 dark:text-white/30">🗣 not promoted yet</p>;
  }
  const days = daysAgo(posts[0].date);
  return (
    <p className="mt-1 text-xs text-black/40 dark:text-white/40">
      🗣 {posts.length} {posts.length === 1 ? "post" : "posts"}
      {days != null && (
        <>
          {" · "}
          <span className={freshnessColor(days)}>last promoted {agoLabel(days)}</span>
        </>
      )}
    </p>
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

// Growth lines for a project: audience you're building (followers, engagement).
// Renders nothing until there's at least one real number, so the card stays
// honest. Number + delta now; a per-week rate sparkline once history allows.
function ProjectGrowth({ projectName }: { projectName: string }) {
  const lines = growth.filter((g) => g.project === projectName && g.series.length > 0);
  if (lines.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((g) => {
        const v = growthView(g.series)!;
        return (
          <div key={g.key} className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wide text-black/30 dark:text-white/30">
              {g.label}
            </span>
            <span className="flex items-center gap-1.5">
              {v.showChart && (
                <Sparkline data={v.weeklyRate} className="h-4 w-14" />
              )}
              {v.delta != null && v.delta !== 0 && (
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    v.delta > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-black/40 dark:text-white/40"
                  }`}
                >
                  {v.delta > 0 ? `+${v.delta}` : v.delta}
                </span>
              )}
              <span className="text-xs font-semibold tabular-nums text-black/60 dark:text-white/60">
                {v.latest.toLocaleString()}
              </span>
            </span>
          </div>
        );
      })}
    </div>
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
