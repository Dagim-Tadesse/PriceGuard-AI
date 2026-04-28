export type Trend = "increasing" | "decreasing" | "stable" | "unknown";
export type Action = "buy_now" | "wait";
export type Role = "Buyer" | "Seller" | "Admin";

export interface PriceSummary {
  product: string;
  price: number;
  location: string;
  trend: Trend;
  action: Action;
}

export interface PriceRecord {
  id: number;
  product: string;
  price: number;
  location: string;
  date: string;
}

export interface Prediction {
  trend: Trend | string;
  action: Action | string;
  confidence: number;
  reason: string;
  predicted_price: number | null;
  current_price?: number;
}

export interface AddPricePayload {
  product: string;
  price: number;
  location: string;
}

export interface ApiError extends Error {
  status?: number;
  details?: Record<string, unknown>;
  friendly: string;
}