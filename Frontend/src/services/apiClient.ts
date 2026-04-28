import type { ApiError } from "@/types/api";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000/api";

function makeError(message: string, opts: Partial<ApiError> = {}): ApiError {
  const err = new Error(message) as ApiError;
  err.friendly = opts.friendly ?? message;
  err.status = opts.status;
  err.details = opts.details;
  return err;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw makeError("Network failure", {
      friendly: "Backend not reachable. Start the backend server first.",
    });
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* no-op */
  }

  if (!res.ok) {
    const friendly =
      data?.error ?? data?.detail ?? `Request failed with status ${res.status}`;
    throw makeError(friendly, {
      friendly,
      status: res.status,
      details: data?.details,
    });
  }
  return data as T;
}

export const API_BASE = BASE;