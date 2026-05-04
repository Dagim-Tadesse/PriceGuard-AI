import type { AddPricePayload, Action, Prediction, PriceRecord, PriceSummary, Trend } from "@/types/api";
import { apiFetch } from "./apiClient";
import { categoryFor, markSubmittedProduct, sourceLabel } from "@/utils/trust";

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
  const rows = await apiFetch<PriceSummary[]>("/prices/");
  return rows.map((row) => ({
    ...row,
    category: row.category ?? categoryFor(row.product),
    source: row.source ?? sourceLabel(row.product),
  }));
};

export const getHistory = async (product: string) => {
  const rows = await apiFetch<PriceRecord[]>(`/prices/${encodeURIComponent(product)}/`);
  return rows.map(normalizeRow);
};

export const getPrediction = async (product: string): Promise<Prediction> => {
  return apiFetch<Prediction>(`/prediction/${encodeURIComponent(product)}/`);
};

export const addPrice = async (payload: AddPricePayload) => {
  const inserted = await apiFetch<PriceRecord>("/prices/add/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  markSubmittedProduct(payload.product);
  return {
    ...inserted,
    category: categoryFor(inserted.product),
    source: inserted.source ?? sourceLabel(inserted.product),
  };
};

export const updatePrice = async (
  id: number,
  patch: Partial<Pick<AddPricePayload, "price" | "location" | "product">> & { confirmations?: number },
) => {
  const record = await apiFetch<PriceRecord>(`/prices/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return {
    ...record,
    category: categoryFor(record.product),
    source: record.source ?? sourceLabel(record.product),
  };
};

export const confirmPrice = async (id: number, confirmations: number) => {
  const record = await apiFetch<PriceRecord>(`/prices/${id}/confirm/`, {
    method: "PATCH",
    body: JSON.stringify({ confirmations }),
  });
  return {
    ...record,
    category: categoryFor(record.product),
    source: record.source ?? sourceLabel(record.product),
  };
};