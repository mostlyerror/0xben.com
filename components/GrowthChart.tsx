import { growth } from "@/lib/site";

// A dependency-free area chart drawn as raw SVG. We scale data points
// into a fixed viewBox so it stays crisp at any size. No chart library
// needed for something this simple — and it renders on the server.

const W = 600;
const H = 220;
const PAD = 24;

export function GrowthChart() {
  const { label, unit, points } = growth;
  const ys = points.map((p) => p.y);
  const maxY = Math.max(...ys, 1); // avoid divide-by-zero on an all-zero series
  const latest = points[points.length - 1]?.y ?? 0;

  // Map each point into SVG coordinates (y is inverted in SVG space).
  const coords = points.map((p, i) => {
    const x = PAD + (i / Math.max(points.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - (p.y / maxY) * (H - PAD * 2);
    return { x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H - PAD} L ${coords[0].x.toFixed(1)} ${H - PAD} Z`;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-black/60 dark:text-white/60">
          {label}
        </h3>
        <p className="text-2xl font-semibold tabular-nums">
          {unit}
          {latest.toLocaleString()}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${label} over time`}
      >
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#growthFill)" className="text-indigo-500" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-indigo-500"
        />

        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 5 : 3}
            className="fill-indigo-500"
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-xs text-black/40 dark:text-white/40">
        {points.map((p, i) => (
          <span key={i}>{p.x}</span>
        ))}
      </div>
    </div>
  );
}
