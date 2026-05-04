import { auth } from "@/state/stores";
import { apiFetch } from "@/services/apiClient";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase not configured");
}

type UserProfile = {
  id?: number;
  name: string;
  email: string;
  role: string;
};

async function supabaseAuthSignup(email: string, password: string) {
  requireConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Supabase may return a 429 when the SMTP/email send rate limit is hit.
    // For demo/dev flows we can continue (profile creation) while logging the condition.
    if (data?.error_code === "over_email_send_rate_limit" || res.status === 429) {
      // don't throw — return the response so caller can proceed to create the profile
      // Note: in production prefer creating users via a backend using the service_role key
      console.warn("Supabase email send rate limit hit; proceeding without blocking signup.", data);
      return data;
    }

    throw new Error(data?.error_description ?? data?.error ?? JSON.stringify(data));
  }

  return data;
}

async function supabaseAuthSignin(email: string, password: string) {
  requireConfig();
  const body = new URLSearchParams({
    grant_type: "password",
    email,
    password,
  });

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description ?? data?.error ?? JSON.stringify(data));
  return data;
}

async function insertUserProfile(name: string, email: string, role: string) {
  const payload = { name, email, role };

  const base = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_BACKEND_BASE_URL ?? "http://127.0.0.1:8000/api";
  const url = `${base}/users/`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Network-level failure (server down, CORS preflight blocked, DNS, etc.)
    console.error("Failed to POST profile to backend", { url, payload, err });
    throw new Error(
      `Failed to reach backend at ${url}. Is the backend running? Check CORS and network. (${(err as Error)?.message})`
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? data?.detail ?? JSON.stringify(data) ?? `Request failed with status ${res.status}`);
  return data as UserProfile;
}

async function fetchUserProfile(email: string): Promise<UserProfile> {
  const users = await apiFetch<UserProfile[]>("/users/");
  const profile = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (!profile) throw new Error("No profile found for this account. Please sign up first.");
  return profile;
}

export async function signUpAndCreateProfile(name: string, email: string, password: string, role: string) {
  // 1) create auth account in Supabase
  await supabaseAuthSignup(email, password);
  // 2) insert the profile through the backend API so the browser does not hit Supabase RLS
  const profile = await insertUserProfile(name, email, role);
  // 3) set local app auth state (demo-friendly)
  auth.signIn(name, role as any);
  return profile;
}

export async function signInWithPassword(email: string, password: string) {
  await supabaseAuthSignin(email, password);
  const profile = await fetchUserProfile(email);
  auth.signIn(profile.name, profile.role as any);
  return profile;
}

export default { signUpAndCreateProfile };
