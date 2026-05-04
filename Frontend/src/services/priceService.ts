import type { AddPricePayload, Action, Prediction, PriceRecord, PriceSummary, Trend } from "@/types/api";
import { categoryFor, markSubmittedProduct, sourceLabel } from "@/utils/trust";

type SupabasePriceRow = {
  id: number;
  product: string;
  price: number;
  location: string;
  source: "user" | "demo";
  submitted_by_id: number | null;
  confirmations: number;
  date: string;
};

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

function requireSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in the frontend env.");
  }
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  requireSupabaseConfig();
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
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

function normalizeRow(row: SupabasePriceRow): PriceRecord {
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
  const rows = await supabaseFetch<SupabasePriceRow[]>(
    `/pricebudget_prices?select=id,product,price,location,source,submitted_by_id,confirmations,date&order=product.asc,date.asc`,
  );

  const latestByProduct = new Map<string, SupabasePriceRow>();
  for (const row of rows) {
    latestByProduct.set(row.product, row);
  }

  const latestProducts = Array.from(latestByProduct.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return latestProducts.map((row) => {
    const productRows = rows.filter((item) => item.product === row.product).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const previous = productRows.length > 1 ? productRows[productRows.length - 2] : null;
    const trend = trendFromPrices(previous ? Number(previous.price) : null, Number(row.price));
    return {
      product: row.product,
      price: Number(row.price),
      location: row.location,
      trend,
      action: actionFromTrend(trend),
      category: categoryFor(row.product),
      source: row.source === "user" ? "User Submitted Data" : "Simulated Demo Data",
      confidenceLabel: trend === "stable" ? "Medium" : "High",
      confirmedBy: row.confirmations,
      lowData: productRows.length < 3,
      trustHint: productRows.length >= 3 ? "Based on multiple reports" : "Based on a single report",
    } satisfies PriceSummary;
  });
};

export const getHistory = async (product: string) => {
  const rows = await supabaseFetch<SupabasePriceRow[]>(
    `/pricebudget_prices?select=id,product,price,location,source,submitted_by_id,confirmations,date&product=eq.${encodeURIComponent(product)}&order=date.asc`,
  );
  return rows.map(normalizeRow);
};

export const getPrediction = async (product: string): Promise<Prediction> => {
  const history = await getHistory(product);
  if (history.length === 0) {
    return {
      trend: "unknown",
      action: "wait",
      confidence: 0,
      reason: `No price history found for '${product}'`,
      predicted_price: null,
      current_price: null,
      lowData: true,
      dataPoints: 0,
    };
  }

  const current = history[history.length - 1].price;
  const previous = history.length > 1 ? history[history.length - 2].price : null;
  const trend = trendFromPrices(previous, current);
  const action = actionFromTrend(trend);
  const direction = trend === "increasing" ? 1.06 : trend === "decreasing" ? 0.95 : 1.0;
  const predictedPrice = trend === "stable" ? Math.round(current) : Math.round(current * direction);

  return {
    trend,
    action,
    confidence: history.length >= 6 ? 0.86 : history.length >= 3 ? 0.68 : 0.42,
    reason:
      trend === "increasing"
        ? "Recent price movement suggests upward pressure. Buying sooner is safer."
        : trend === "decreasing"
          ? "Recent price movement is softening. Waiting could save money."
          : "The latest observations are stable, so there is no strong timing edge yet.",
    predicted_price: predictedPrice,
    current_price: current,
    confidenceLabel: history.length >= 6 ? "High" : history.length >= 3 ? "Medium" : "Low",
    lowData: history.length < 3,
    dataPoints: history.length,
    trustHint: history.length >= 3 ? "Based on multiple reports" : "Based on a single report",
  };
};

export const addPrice = async (payload: AddPricePayload) => {
  const inserted = await supabaseFetch<SupabasePriceRow[]>(
    "/pricebudget_prices",
    {
      method: "POST",
      body: JSON.stringify({
        product: payload.product,
        price: payload.price,
        location: payload.location,
        source: "user",
        confirmations: 1,
        date: new Date().toISOString(),
      }),
    },
  );

  markSubmittedProduct(payload.product);
  const record = normalizeRow(inserted[0]);
  return {
    ...record,
    category: categoryFor(record.product),
    source: record.source ?? sourceLabel(record.product),
  };
};

export const updatePrice = async (
  id: number,
  patch: Partial<Pick<AddPricePayload, "price" | "location" | "product">> & { confirmations?: number },
) => {
  const updated = await supabaseFetch<SupabasePriceRow[]>(
    `/pricebudget_prices?id=eq.${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );

  const record = normalizeRow(updated[0]);
  return {
    ...record,
    category: categoryFor(record.product),
    source: record.source ?? sourceLabel(record.product),
  };
};

export const confirmPrice = async (id: number, confirmations: number) => {
  return updatePrice(id, { confirmations });
};