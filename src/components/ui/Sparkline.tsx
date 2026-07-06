/** Minimal inline SVG sparkline. Numbers-dense product, so charts stay small
 *  and supportive — the figure next to them is the actionable data. */
export function Sparkline({
  values,
  width = 160,
  height = 40,
  tone = "accent",
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: "accent" | "ok" | "caution" | "danger";
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const stroke = {
    accent: "var(--color-accent-500)",
    ok: "var(--color-ok-500)",
    caution: "var(--color-caution-500)",
    danger: "var(--color-danger-500)",
  }[tone];
  const [lastX, lastY] = pts[pts.length - 1];
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} />
    </svg>
  );
}
