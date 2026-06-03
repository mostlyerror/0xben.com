"use client";

import { useState, type CSSProperties } from "react";

type Entry = { date: string; what: string; tag?: string };

// GitHub-style contribution calendar of ships over the last 26 weeks.
// Launch days render a 🚀 that wiggles on hover and launches (+ toast) on
// click. `nowMs` comes from the server so SSR and hydration agree on "today".
export function ShipHeatmap({ entries, nowMs }: { entries: Entry[]; nowMs: number }) {
  const [toast, setToast] = useState<string | null>(null);
  const [launching, setLaunching] = useState<string | null>(null);

  const WEEKS = 26;
  const DAY = 86_400_000;
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const counts = new Map<string, number>();
  const launchOf = new Map<string, Entry>();
  for (const e of entries) {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) continue;
    const k = dayKey(d);
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (e.tag === "launch") launchOf.set(k, e);
  }

  const today = new Date(nowMs);
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

  const fireLaunch = (k: string, e: Entry) => {
    setLaunching(k);
    setToast(`🚀 ${e.what} · ${e.date}`);
    setTimeout(() => setLaunching(null), 650);
    setTimeout(() => setToast((t) => (t === `🚀 ${e.what} · ${e.date}` ? null : t)), 2600);
  };

  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const cur = new Date(start.getTime() + (w * 7 + d) * DAY);
      const k = dayKey(cur);
      return {
        k,
        future: cur.getTime() > today.getTime(),
        count: counts.get(k) ?? 0,
        launch: launchOf.get(k),
        label: cur.toDateString(),
      };
    }),
  );

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px] sm:gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] sm:gap-1">
            {week.map((day, di) =>
              day.launch ? (
                <button
                  key={di}
                  type="button"
                  onClick={() => fireLaunch(day.k, day.launch!)}
                  title={`${day.label}: launched 🚀 — click me`}
                  className="relative size-2.5 cursor-pointer sm:size-5"
                >
                  <span
                    className={`ship-rocket absolute inset-0 flex items-center justify-center text-[11px] leading-none sm:text-base ${
                      launching === day.k ? "ship-launching" : ""
                    }`}
                  >
                    🚀
                  </span>
                  {launching === day.k && (
                    <span aria-hidden className="pointer-events-none absolute inset-0">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <span
                          key={s}
                          className="ship-spark absolute left-1/2 top-1/2 size-1 rounded-full bg-amber-400"
                          style={{ "--a": `${s * 72}deg` } as CSSProperties}
                        />
                      ))}
                    </span>
                  )}
                </button>
              ) : (
                <div
                  key={di}
                  title={day.future ? undefined : `${day.label}: ${day.count} ship${day.count === 1 ? "" : "s"}`}
                  className={`size-2.5 rounded-[2px] transition-transform sm:size-5 sm:rounded-sm ${
                    day.future
                      ? "bg-transparent"
                      : `${level(day.count)} ${day.count > 0 ? "hover:scale-150 hover:rounded-sm" : "hover:scale-125"}`
                  }`}
                />
              ),
            )}
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-xl [animation:ship-toast-in_0.2s_ease-out] dark:bg-white dark:text-black">
          {toast}
        </div>
      )}
    </div>
  );
}
