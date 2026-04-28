import type { PriceRecord } from "@/types/api";

export interface PriceAlert {
  product: string;
  pctChange: number;
  from: number;
  to: number;
}

export function computeAlerts(history: PriceRecord[]): PriceAlert | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const change = (last.price - prev.price) / prev.price;
  if (change > 0.08)
    return { product: last.product, pctChange: change, from: prev.price, to: last.price };
  return null;
}
