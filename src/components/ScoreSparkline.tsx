interface Props {
  points: { day: string; avg: number }[];
  width?: number;
  height?: number;
}

export function ScoreSparkline({ points, width = 600, height = 120 }: Props) {
  if (points.length < 2) {
    return (
      <div className="font-mono text-xs text-muted-foreground py-12 text-center border border-border rounded">
        Not enough data to show a trend yet. Run another scan to start tracking.
      </div>
    );
  }
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const xs = points.map((_, i) => pad + (i * w) / (points.length - 1));
  const ys = points.map((p) => pad + h - (p.avg / 100) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${d} L${xs[xs.length - 1].toFixed(1)},${(pad + h).toFixed(1)} L${xs[0].toFixed(1)},${(pad + h).toFixed(1)} Z`;
  const last = points[points.length - 1];
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <path d={area} fill="hsl(var(--accent) / 0.15)" />
        <path d={d} fill="none" stroke="hsl(var(--accent))" strokeWidth="2" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill="hsl(var(--accent))" />
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground mt-2">
        <span>{points[0].day}</span>
        <span>{last.day} · {last.avg}</span>
      </div>
    </div>
  );
}
