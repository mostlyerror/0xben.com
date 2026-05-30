import Image from "next/image";
import { site, socials, projects, manualStats, inlineLinks, shipped, status, tinyship } from "@/lib/site";
import { ShipHeatmap } from "@/components/ShipHeatmap";
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
            </a>
          ))}
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

        {/* TinyShip manifesto — the claim, right under the live evidence */}
        <div className="mt-1 flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
            <span className="font-semibold text-black dark:text-white">
              🚀 {tinyship.wordmark}
            </span>{" "}
            — {tinyship.manifesto}
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

      <footer className="mt-auto pt-8 text-sm text-black/40 dark:text-white/40">
        © {new Date().getFullYear()} {site.name} · {site.domain}
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
