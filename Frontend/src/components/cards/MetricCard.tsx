import { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  highlight?: boolean;
  delay?: number;
  animate?: boolean;
}

export default function MetricCard({ label, value, icon: Icon, hint, highlight, delay = 0, animate }: Props) {
  const isNumeric = typeof value === "number";
  return (
    <div
      className={`relative panel-elevated p-6 overflow-hidden animate-slide-up ${
        highlight ? "glow-border" : ""
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</div>
          <div className={`text-4xl font-display font-semibold tabular ${highlight ? "text-primary glow-text" : ""}`}>
            {animate && isNumeric ? <AnimatedNumber value={value as number} /> : value}
          </div>
          {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
        </div>
        <div className={`size-10 rounded-xl flex items-center justify-center ${
          highlight ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
        }`}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="absolute -bottom-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}