import { apiFetch } from "./apiClient";
import type { AddPricePayload, PriceRecord, PriceSummary, Prediction } from "@/types/api";
import { buildMockHistory, buildMockPrediction, buildMockSummaries } from "./mockData";
import { categoryFor, markSubmittedProduct, sourceLabel } from "@/utils/trust";

async function withMockFallback<T>(p: Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await p;
  } catch (e: any) {
    if (e?.friendly?.includes("Backend not reachable")) return fallback();
    throw e;
  }
}

export const getPrices = () =>
  withMockFallback(apiFetch<PriceSummary[]>("/prices/"), buildMockSummaries).then((items) =>
    items.map((item) => ({
      ...item,
      category: item.category ?? categoryFor(item.product),
      source: item.source ?? sourceLabel(item.product),
    })),
  );

export const getHistory = (product: string) =>
  withMockFallback(
    apiFetch<PriceRecord[]>(`/prices/${encodeURIComponent(product)}/`),
    () => buildMockHistory(product),
  ).then((items) =>
    items.map((item) => ({
      ...item,
      category: item.category ?? categoryFor(item.product),
      source: item.source ?? sourceLabel(item.product),
    })),
  );

export const getPrediction = (product: string) =>
  withMockFallback(
    apiFetch<Prediction>(`/prediction/${encodeURIComponent(product)}/`),
    () => buildMockPrediction(product),
  );

export const addPrice = (payload: AddPricePayload) =>
  apiFetch<PriceRecord>("/prices/add/", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((record) => {
    markSubmittedProduct(payload.product);
    return {
      ...record,
      category: record.category ?? categoryFor(record.product),
      source: record.source ?? sourceLabel(record.product),
    };
  });