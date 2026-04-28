import type { Prediction } from "@/types/api";

export function bestTimeMessage(p: Prediction): string {
  const trend = String(p.trend).toLowerCase();
  const action = String(p.action).toLowerCase();
  if (action === "buy_now" && trend === "increasing")
    return "Buy today — prices are climbing. Acting now locks the lower price.";
  if (trend === "decreasing")
    return "Wait — prices are softening. A better window is likely within a few days.";
  if (p.confidence >= 0.7)
    return "Buy within the next 1–2 days — high-confidence signal in your favor.";
  return "Monitor for another day — the signal is weak. Re-check tomorrow.";
}
