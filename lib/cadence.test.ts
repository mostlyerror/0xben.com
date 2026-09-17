import { test } from "node:test";
import assert from "node:assert/strict";
import { shipCadence } from "./cadence.ts";

const DAY = 86_400_000;
// Fixed clock: noon local time, Jun 21 2026.
const NOW = new Date(2026, 5, 21, 12, 0, 0).getTime();

test("empty ledger yields nulls and zeros", () => {
  const c = shipCadence([], NOW);
  assert.deepEqual(c, {
    total: 0,
    daysSinceShip: null,
    lastShipLabel: null,
    freshLabel: null,
    shipsThisMonth: 0,
    weekStreak: 0,
  });
});

test("a ship today reads 'shipped today' and is fresh", () => {
  const c = shipCadence(["Jun 21, 2026"], NOW);
  assert.equal(c.daysSinceShip, 0);
  assert.equal(c.lastShipLabel, "shipped today");
  assert.equal(c.freshLabel, "shipped today");
});

test("one day ago is singular", () => {
  const c = shipCadence(["Jun 20, 2026"], NOW);
  assert.equal(c.lastShipLabel, "1 day ago");
});

test("uses the newest date regardless of input order", () => {
  const c = shipCadence(["Jun 1, 2026", "Jun 19, 2026", "May 3, 2026"], NOW);
  assert.equal(c.daysSinceShip, 2);
  assert.equal(c.lastShipLabel, "2 days ago");
});

test("stale ledger keeps the raw label but drops the fresh label", () => {
  const c = shipCadence(["Jun 21, 2026"], NOW + 88 * DAY);
  assert.equal(c.daysSinceShip, 88);
  assert.equal(c.lastShipLabel, "88 days ago");
  assert.equal(c.freshLabel, null);
});

test("14 days is still fresh, 15 is not", () => {
  assert.equal(shipCadence(["Jun 21, 2026"], NOW + 14 * DAY).freshLabel, "14 days ago");
  assert.equal(shipCadence(["Jun 21, 2026"], NOW + 15 * DAY).freshLabel, null);
});

test("unparseable dates count toward total but nothing else", () => {
  const c = shipCadence(["not a date", "Jun 20, 2026"], NOW);
  assert.equal(c.total, 2);
  assert.equal(c.daysSinceShip, 1);
  assert.equal(c.shipsThisMonth, 1);
});

test("shipsThisMonth counts only the clock's month and year", () => {
  const c = shipCadence(["Jun 2, 2026", "Jun 19, 2026", "May 30, 2026", "Jun 5, 2025"], NOW);
  assert.equal(c.shipsThisMonth, 2);
});

test("weekStreak counts consecutive 7-day windows back from now", () => {
  // Windows: (Jun14,Jun21], (Jun7,Jun14], (May31,Jun7]; then a gap.
  const c = shipCadence(["Jun 20, 2026", "Jun 10, 2026", "Jun 3, 2026", "May 10, 2026"], NOW);
  assert.equal(c.weekStreak, 3);
});

test("weekStreak is zero when the latest window is empty", () => {
  const c = shipCadence(["Jun 1, 2026"], NOW);
  assert.equal(c.weekStreak, 0);
});
