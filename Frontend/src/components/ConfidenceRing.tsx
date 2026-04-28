interface Props { value: number; size?: number; label?: string }
export default function ConfidenceRing({ value, size = 120, label }: Props) {
  const v = Math.max(0, Math.min(1, value));
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - v);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#ring-grad)" strokeWidth="6" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0 0 6px hsl(var(--primary)/0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl font-bold tabular text-primary glow-text">{Math.round(v * 100)}%</div>
        {label && <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  );
}