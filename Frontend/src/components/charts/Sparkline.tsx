import { useMemo } from "react";

interface Props { trend: string }

export default function Sparkline({ trend }: Props) {
  const points = useMemo(() => {
    const n = 20;
    const arr: number[] = [];
    let v = 50;
    for (let i = 0; i < n; i++) {
      const drift = trend === "increasing" ? 1.2 : trend === "decreasing" ? -1.2 : 0;
      v += drift + (Math.random() - 0.5) * 6;
      arr.push(Math.max(5, Math.min(95, v)));
    }
    return arr;
  }, [trend]);

  const w = 96, h = 48;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / 100) * h}`).join(" ");
  const fill = `${path} L ${w} ${h} L 0 ${h} Z`;

  const color =
    trend === "increasing" ? "hsl(35 100% 60%)" : trend === "decreasing" ? "hsl(168 85% 52%)" : "hsl(180 10% 55%)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={`sg-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${trend})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
