import type { AddPricePayload, Action, Prediction, PriceRecord, PriceSummary, Trend } from "@/types/api";
import { categoryFor, markSubmittedProduct, sourceLabel } from "@/utils/trust";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase not configured");
}

async function supaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  requireConfig();
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorDetails = await res.text().catch(() => "");
    throw new Error(`Supabase request failed: ${res.status} ${errorDetails}`);
  }
  return res.json();
}

function trendFromPrices(previous: number | null, current: number): Trend {
  if (previous == null) return "unknown";
  const pctChange = (current - previous) / previous;
  if (pctChange > 0.01) return "increasing";
  if (pctChange < -0.01) return "decreasing";
  return "stable";
}

function actionFromTrend(trend: Trend): Action {
  return trend === "decreasing" ? "wait" : "buy_now";
}

function normalizeRow(row: any): PriceRecord {
  if (!row) return {} as PriceRecord;
  return {
    id: row.id,
    product: row.product,
    price: Number(row.price),
    location: row.location,
    date: row.date,
    category: categoryFor(row.product),
    source: row.source === "user" ? "User Submitted Data" : "Simulated Demo Data",
  };
}

export const getPrices = async () => {
  // Read all from Supabase table 'pricebudget_prices'
  const rows = await supaFetch<any[]>("/pricebudget_prices?select=*&order=date.desc");
  
  // Group by product to get latest price and trend
  const products = new Map<string, any[]>();
  rows.forEach(r => {
    if (!products.has(r.product)) products.set(r.product, []);
    products.get(r.product)!.push(r);
  });

  const summaries: PriceSummary[] = [];
  products.forEach((history, product) => {
    const latest = history[0];
    const prev = history[1] ? history[1].price : null;
    const trend = trendFromPrices(prev, latest.price);
    
    summaries.push({
      product: latest.product,
      price: latest.price,
      location: latest.location || "Unknown",
      trend,
      action: actionFromTrend(trend),
      category: categoryFor(latest.product),
      source: latest.source === "user" ? "User Submitted Data" : "Simulated Demo Data",
    });
  });

  return summaries;
};

export const getHistory = async (product: string) => {
  const rows = await supaFetch<any[]>(`/pricebudget_prices?product=eq.${encodeURIComponent(product)}&order=date.desc`);
  return rows.map(normalizeRow);
};

export const getPrediction = async (product: string): Promise<Prediction> => {
  // Basic naive frontend prediction, since we don't have the backend AI script available
  const history = await getHistory(product);
  if (history.length < 2) {
     return { trend: "unknown", action: "wait", confidence: 0, reason: "Not enough data", predicted_price: null };
  }
  const latest = history[0].price;
  const prev = history[1].price;
  const trend = trendFromPrices(prev, latest);
  return {
    trend,
    action: actionFromTrend(trend),
    confidence: 0.5,
    reason: "Naive frontend prediction (backend bypassed)",
    predicted_price: latest + (latest - prev)
  };
};

export const addPrice = async (payload: AddPricePayload) => {
  const inserted = await supaFetch<any[]>("/pricebudget_prices", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ 
      ...payload, 
      source: "user",
      date: new Date().toISOString() 
    }),
  });

  markSubmittedProduct(payload.product);
  return normalizeRow(inserted[0]);
};

export const updatePrice = async (
  id: number,
  patch: Partial<Pick<AddPricePayload, "price" | "location" | "product">> & { confirmations?: number },
) => {
  const record = await supaFetch<any[]>(`/pricebudget_prices?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return record && record.length > 0 ? normalizeRow(record[0]) : ({} as PriceRecord);
};

export const confirmPrice = async (id: number, confirmations: number) => {
  const record = await supaFetch<any[]>(`/pricebudget_prices?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ confirmations }),
  });
  return record && record.length > 0 ? normalizeRow(record[0]) : ({} as PriceRecord);
};