import Image from "next/image";
import { site, socials, projects, manualStats, inlineLinks, shipped } from "@/lib/site";
import { getGitHubStats } from "@/lib/github";

// Server component: GitHub stats are fetched here (cached 1h) so the
// page arrives fully rendered with no client-side loading flash.
export default async function Home() {
  const gh = await getGitHubStats(site.github);

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-14 px-6 py-16 sm:py-24">
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
        <div className="mt-2 flex flex-wrap gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* Bio */}
      <section className="flex flex-col gap-4 leading-relaxed text-black/80 dark:text-white/80">
        {site.bio.map((p, i) => (
          <p key={i}>
            <Linkified text={p} />
          </p>
        ))}
      </section>

      {/* Shipped — the proof-of-shipping ledger */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
              Shipped
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

        <ShipHeatmap entries={shipped} />

        <ol className="flex flex-col">
          {shipped.map((s, i) => (
            <li
              key={i}
              className="border-t border-black/[0.06] first:border-t-0 dark:border-white/[0.08]"
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

      {/* Projects */}
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
          What I'm building
        </h2>
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-black/10 p-4 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]"
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:underline">{p.name}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {p.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{p.metricValue}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {p.metricLabel}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-auto flex flex-col gap-2 pt-8 text-sm text-black/40 dark:text-white/40">
        {gh && (
          <a
            href={`https://github.com/${site.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit transition-colors hover:text-black/60 dark:hover:text-white/60"
          >
            {gh.publicRepos} repos on GitHub ↗
          </a>
        )}
        <span>
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </span>
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

// GitHub-style contribution calendar of ships over the last 26 weeks.
// Launch days (a ship tagged "launch") render a 🚀 instead of a square.
function ShipHeatmap({ entries }: { entries: { date: string; tag?: string }[] }) {
  const WEEKS = 26;
  const DAY = 86_400_000;
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const counts = new Map<string, number>();
  const launches = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) continue;
    const k = dayKey(d);
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (e.tag === "launch") launches.add(k);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisSunday = new Date(today.getTime() - today.getDay() * DAY);
  const start = new Date(thisSunday.getTime() - (WEEKS - 1) * 7 * DAY);

  const level = (n: number) =>
    n === 0
      ? "bg-black/[0.06] dark:bg-white/[0.07]"
      : n === 1
        ? "bg-emerald-300 dark:bg-emerald-800"
        : n === 2
          ? "bg-emerald-400 dark:bg-emerald-600"
          : "bg-emerald-500";

  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const cur = new Date(start.getTime() + (w * 7 + d) * DAY);
      const k = dayKey(cur);
      return {
        future: cur.getTime() > today.getTime(),
        count: counts.get(k) ?? 0,
        launch: launches.has(k),
        label: cur.toDateString(),
      };
    }),
  );

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day.launch ? (
                <div key={di} title={`${day.label}: launched 🚀`} className="relative size-2.5">
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] leading-none">
                    🚀
                  </span>
                </div>
              ) : (
                <div
                  key={di}
                  title={day.future ? undefined : `${day.label}: ${day.count} ship${day.count === 1 ? "" : "s"}`}
                  className={`size-2.5 rounded-[2px] ${day.future ? "bg-transparent" : level(day.count)}`}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Small chip marking the kind of ship (post / wrote / build / launch …).
function Tag({ label }: { label: string }) {
  return (
    <span className="mr-2 rounded bg-black/[0.06] px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-black/50 dark:bg-white/10 dark:text-white/50">
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
