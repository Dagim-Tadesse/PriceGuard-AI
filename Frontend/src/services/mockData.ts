import type { PriceSummary, PriceRecord, Prediction } from "@/types/api";

const products = [
  { name: "Teff Flour 25kg", base: 4200, locations: ["Bole", "Kazanchis", "Merkato", "Adama"] },
  { name: "Cooking Oil 5L", base: 950, locations: ["Megenagna", "Piassa", "Hawassa"] },
  { name: "Berbere 1kg", base: 480, locations: ["Merkato", "Bahir Dar", "Lideta"] },
  { name: "Sugar 50kg", base: 5800, locations: ["Bole", "CMC", "Mekelle"] },
  { name: "Coffee Beans 1kg", base: 720, locations: ["Bole", "Hawassa", "Adama"] },
  { name: "Wheat Flour 25kg", base: 3100, locations: ["Merkato", "Gondar", "Bishoftu"] },
  { name: "Onions 100kg", base: 6400, locations: ["Adama", "Bahir Dar"] },
  { name: "Smartphone X12", base: 38500, locations: ["Bole", "CMC"] },
];

function jitter(base: number, pct: number) {
  return Math.round(base * (1 + (Math.random() - 0.5) * pct));
}

export function buildMockSummaries(): PriceSummary[] {
  return products.map((p, i) => {
    const trend = (["increasing", "decreasing", "stable", "increasing"] as const)[i % 4];
    const action = trend === "decreasing" ? "wait" : "buy_now";
    return {
      product: p.name,
      price: jitter(p.base, 0.04),
      location: p.locations[0],
      trend,
      action,
    };
  });
}

export function buildMockHistory(productName: string): PriceRecord[] {
  const def = products.find((p) => p.name === productName) ?? products[0];
  const out: PriceRecord[] = [];
  let id = 1;
  const days = 30;
  for (let d = days; d >= 0; d--) {
    for (const loc of def.locations) {
      const drift = Math.sin((days - d) / 4) * 0.06 + (Math.random() - 0.5) * 0.04;
      out.push({
        id: id++,
        product: productName,
        price: Math.round(def.base * (1 + drift)),
        location: loc,
        date: new Date(Date.now() - d * 86400000).toISOString(),
      });
    }
  }
  return out;
}

export function buildMockPrediction(productName: string): Prediction {
  const def = products.find((p) => p.name === productName) ?? products[0];
  const trend = Math.random() > 0.5 ? "increasing" : "decreasing";
  const action = trend === "increasing" ? "buy_now" : "wait";
  const current = jitter(def.base, 0.03);
  const predicted = trend === "increasing" ? Math.round(current * 1.06) : Math.round(current * 0.95);
  return {
    trend,
    action,
    confidence: 0.62 + Math.random() * 0.32,
    reason:
      trend === "increasing"
        ? "Recent 7-day momentum and reduced supply suggest upward pressure. Locking the price now is recommended."
        : "Prices have softened across multiple locations and inventory is rising. Waiting 1–3 days is favorable.",
    predicted_price: predicted,
    current_price: current,
  };
}