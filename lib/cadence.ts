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
