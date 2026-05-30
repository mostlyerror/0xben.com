// Tiny dependency-free SVG sparkline for per-project traffic trends.
// Renders nothing if there aren't at least two points.
export function Sparkline({
  data,
  className = "",
}: {
  data: number[];
  className?: string;
}) {
  if (!data || data.length < 2) return null;

  const W = 80;
  const H = 22;
  const PAD = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;

  const pts = data.map((y, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const yy = H - PAD - ((y - min) / span) * (H - PAD * 2);
    return [x, yy] as const;
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H - PAD} L ${pts[0][0].toFixed(1)} ${H - PAD} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`text-emerald-500 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={1.8} fill="currentColor" />
    </svg>
  );
}
