import { shipped, tinyship } from "@/lib/site";
import type { Cadence } from "@/lib/cadence";
import { ShipHeatmap } from "@/components/ShipHeatmap";

// Shipped: the proof-of-shipping ledger with its cadence stats and heatmap.
export function ShipLedger({ cadence, nowMs }: { cadence: Cadence; nowMs: number }) {
  const { lastShipLabel, shipsThisMonth, weekStreak, total } = cadence;
  return (
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
            <span className="text-sm tabular-nums text-black/40 dark:text-white/40">
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
          {` · ${total} total`}
        </p>
      </div>

      <ShipHeatmap entries={shipped} nowMs={nowMs} />

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

      <ol className="max-h-[26rem] overflow-y-auto pr-2 sm:columns-2 sm:gap-x-8">
        {shipped.map((s, i) => {
          const visible = s.gloss ?? s.what;
          const detailItems = s.gloss ? [s.what, ...(s.details ?? [])] : (s.details ?? []);
          return (
            <li
              key={i}
              className="break-inside-avoid border-t border-black/[0.06] first:border-t-0 dark:border-white/[0.08]"
            >
              {detailItems.length > 0 ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="w-24 shrink-0 text-sm tabular-nums text-black/40 dark:text-white/40">
                      {s.date}
                    </span>
                    <span className="flex-1 text-sm text-black/80 dark:text-white/80">
                      {s.tag && <Tag label={s.tag} />}
                      {visible}
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
                        {detailItems.map((d, j) => (
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
                        {visible} ↗
                      </a>
                    ) : (
                      visible
                    )}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
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
