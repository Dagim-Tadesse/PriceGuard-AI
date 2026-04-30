import type { ConfidenceLabel, PriceRecord, ProductCategory } from "@/types/api";

const STORAGE_SUBMITTED_PRODUCTS = "pg.submittedProducts";

const FOOD = ["teff", "flour", "oil", "coffee", "sugar", "onion", "berbere", "bread", "tomato", "potato", "banana", "meat"];
const ESSENTIALS = ["soap", "detergent", "bucket", "tissue", "water", "salt", "rice", "milk", "egg", "cooking oil"];
const ELECTRONICS = ["phone", "smartphone", "laptop", "tablet", "tv", "television", "camera", "charger", "earbud", "speaker"];

function readSubmittedProducts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SUBMITTED_PRODUCTS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSubmittedProducts(products: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_SUBMITTED_PRODUCTS, JSON.stringify(products));
}

export function markSubmittedProduct(product: string) {
  const normalized = product.trim();
  if (!normalized) return;
  const items = new Set(readSubmittedProducts());
  items.add(normalized);
  writeSubmittedProducts(Array.from(items));
}

export function isUserSubmitted(product: string): boolean {
  return readSubmittedProducts().includes(product.trim());
}

export function sourceLabel(product: string) {
  return isUserSubmitted(product) ? "User Submitted Data" : "Simulated Demo Data";
}

export function categoryFor(product: string): ProductCategory {
  const name = product.toLowerCase();
  if (ELECTRONICS.some((term) => name.includes(term))) return "Electronics";
  if (ESSENTIALS.some((term) => name.includes(term))) return "Essentials";
  return "Food";
}

export function confidenceLabel(confidence: number): ConfidenceLabel {
  if (confidence >= 0.75) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

export function lowDataWarning(count: number) {
  return count < 3 ? "Limited data — prediction may be less accurate" : null;
}

export function confirmationLabel(history: PriceRecord[]) {
  const confirmed = Math.min(3, Math.max(1, history.length));
  return `Confirmed by ${confirmed} users`;
}

export function aggregationHint(history: PriceRecord[]) {
  if (history.length >= 3) return "Based on multiple reports";
  if (history.length >= 2) return "Based on 2 reports";
  return "Based on a single report";
}

export function outlierWarning(history: PriceRecord[]) {
  if (history.length < 2) return null;
  const ordered = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last = ordered[ordered.length - 1];
  const prev = ordered[ordered.length - 2];
  if (!prev.price) return null;
  const pctChange = (last.price - prev.price) / prev.price;
  if (Math.abs(pctChange) >= 0.15) return "Unusual price detected";
  if (Math.abs(pctChange) >= 0.08) return "Price changed sharply";
  return null;
}

export function marketTrendLabel(rising: number, falling: number) {
  if (rising > falling + 1) return "Increasing";
  if (falling > rising + 1) return "Decreasing";
  return "Stable";
}

export function externalFactorNote() {
  return "External factors like fuel prices may influence trends.";
}

export function feedbackLoopNote() {
  return "More data → better predictions";
}
