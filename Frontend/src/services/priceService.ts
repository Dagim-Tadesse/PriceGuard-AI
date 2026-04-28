import { apiFetch } from "./apiClient";
import type { AddPricePayload, PriceRecord, PriceSummary, Prediction } from "@/types/api";
import { buildMockHistory, buildMockPrediction, buildMockSummaries } from "./mockData";

async function withMockFallback<T>(p: Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await p;
  } catch (e: any) {
    if (e?.friendly?.includes("Backend not reachable")) return fallback();
    throw e;
  }
}

export const getPrices = () =>
  withMockFallback(apiFetch<PriceSummary[]>("/prices/"), buildMockSummaries);

export const getHistory = (product: string) =>
  withMockFallback(
    apiFetch<PriceRecord[]>(`/prices/${encodeURIComponent(product)}/`),
    () => buildMockHistory(product),
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
  });