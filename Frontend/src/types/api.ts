export type Trend = "increasing" | "decreasing" | "stable" | "unknown";
export type Action = "buy_now" | "wait";
export type Role = "Buyer" | "Seller" | "Admin";
export type ProductCategory = "Food" | "Essentials" | "Electronics";
export type DataSource = "Simulated Demo Data" | "User Submitted Data";
export type ConfidenceLabel = "High" | "Medium" | "Low";

export interface PriceSummary {
  product: string;
  price: number;
  location: string;
  trend: Trend;
  action: Action;
  category?: ProductCategory;
  source?: DataSource;
  confidenceLabel?: ConfidenceLabel;
  confirmedBy?: number;
  lowData?: boolean;
  trustHint?: string;
}

export interface PriceRecord {
  id: number;
  product: string;
  price: number;
  location: string;
  date: string;
  category?: ProductCategory;
  source?: DataSource;
}

export interface Prediction {
  trend: Trend | string;
  action: Action | string;
  confidence: number;
  reason: string;
  predicted_price: number | null;
  current_price?: number;
  confidenceLabel?: ConfidenceLabel;
  lowData?: boolean;
  dataPoints?: number;
  trustHint?: string;
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