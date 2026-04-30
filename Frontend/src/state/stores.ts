import { useSyncExternalStore } from "react";
import type { Role } from "@/types/api";
import { dict, type Lang, type TKey } from "@/i18n/translations";

type Listener = () => void;
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (partial: Partial<T> | ((s: T) => Partial<T>)) => {
      const next = typeof partial === "function" ? (partial as any)(state) : partial;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

function useStore<T, S>(store: ReturnType<typeof createStore<T>>, selector: (s: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  );
}

const STORAGE_AUTH = "pg.auth";
const STORAGE_WATCH = "pg.watch";
const STORAGE_A11Y = "pg.a11y";
const STORAGE_THEME = "pg.theme";
const STORAGE_LANG = "pg.lang";
const STORAGE_CCY = "pg.ccy";
const STORAGE_POINTS = "pg.points";
const STORAGE_LEADERBOARD = "pg.leaderboard";
const STORAGE_DAILY_BONUS = "pg.dailyBonus";

interface AuthState { user: { name: string; role: Role } | null }
const initialAuth: AuthState = (() => {
  if (typeof window === "undefined") return { user: null };
  try {
    const raw = localStorage.getItem(STORAGE_AUTH);
    return raw ? { user: JSON.parse(raw) } : { user: null };
  } catch { return { user: null }; }
})();
const authStore = createStore<AuthState>(initialAuth);

export const auth = {
  signIn: (name: string, role: Role) => {
    const user = { name, role };
    localStorage.setItem(STORAGE_AUTH, JSON.stringify(user));
    authStore.set({ user });
  },
  signOut: () => {
    localStorage.removeItem(STORAGE_AUTH);
    authStore.set({ user: null });
  },
  setRole: (role: Role) => {
    const u = authStore.get().user;
    if (!u) return;
    const user = { ...u, role };
    localStorage.setItem(STORAGE_AUTH, JSON.stringify(user));
    authStore.set({ user });
  },
};
export const useAuth = () => useStore(authStore, (s) => s);

interface Contributor {
  name: string;
  points: number;
}

const initialLeaderboard: { items: Contributor[] } = (() => {
  if (typeof window === "undefined") {
    return {
      items: [
        { name: "Market Scout", points: 120 },
        { name: "Demo Driver", points: 95 },
        { name: "Price Analyst", points: 82 },
      ],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_LEADERBOARD);
    return raw ? { items: JSON.parse(raw) as Contributor[] } : {
      items: [
        { name: "Market Scout", points: 120 },
        { name: "Demo Driver", points: 95 },
        { name: "Price Analyst", points: 82 },
      ],
    };
  } catch {
    return {
      items: [
        { name: "Market Scout", points: 120 },
        { name: "Demo Driver", points: 95 },
        { name: "Price Analyst", points: 82 },
      ],
    };
  }
})();

const leaderboardStore = createStore(initialLeaderboard);

function persistLeaderboard(items: Contributor[]) {
  localStorage.setItem(STORAGE_LEADERBOARD, JSON.stringify(items));
}

function bumpContributor(name: string, delta: number) {
  const state = leaderboardStore.get();
  const items = [...state.items];
  const index = items.findIndex((item) => item.name === name);
  if (index >= 0) {
    items[index] = { ...items[index], points: items[index].points + delta };
  } else {
    items.push({ name, points: delta });
  }
  items.sort((a, b) => b.points - a.points);
  persistLeaderboard(items);
  leaderboardStore.set({ items });
}

function getCurrentUserName() {
  return authStore.get().user?.name ?? "Guest";
}

export const contrib = {
  award: (delta: number, label?: string) => {
    const user = getCurrentUserName();
    const current = Number(localStorage.getItem(STORAGE_POINTS) ?? "0");
    const next = current + delta;
    localStorage.setItem(STORAGE_POINTS, String(next));
    bumpContributor(user, delta);
    return next;
  },
  awardDailyBonus: () => {
    if (typeof window === "undefined") return false;
    const today = new Date().toISOString().slice(0, 10);
    const lastAward = localStorage.getItem(STORAGE_DAILY_BONUS);
    if (lastAward === today) return false;
    localStorage.setItem(STORAGE_DAILY_BONUS, today);
    contrib.award(5);
    return true;
  },
  points: () => Number(localStorage.getItem(STORAGE_POINTS) ?? "0"),
  leaderboard: () => leaderboardStore.get().items,
  usePoints: () => useStore(leaderboardStore, () => Number(localStorage.getItem(STORAGE_POINTS) ?? "0")),
  useLeaderboard: () => useStore(leaderboardStore, (s) => s.items),
};

const initialWatch: { items: string[] } = (() => {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_WATCH);
    return { items: raw ? JSON.parse(raw) : [] };
  } catch { return { items: [] }; }
})();
const watchStore = createStore(initialWatch);
const persistWatch = (items: string[]) => localStorage.setItem(STORAGE_WATCH, JSON.stringify(items));

export const watchlist = {
  toggle: (product: string) => {
    const items = watchStore.get().items;
    const next = items.includes(product) ? items.filter((p) => p !== product) : [...items, product];
    persistWatch(next);
    watchStore.set({ items: next });
  },
  remove: (product: string) => {
    const next = watchStore.get().items.filter((p) => p !== product);
    persistWatch(next);
    watchStore.set({ items: next });
  },
  clear: () => {
    persistWatch([]);
    watchStore.set({ items: [] });
  },
};
export const useWatchlist = () => useStore(watchStore, (s) => s.items);

const initialA11y: { a11y: boolean } = (() => {
  if (typeof window === "undefined") return { a11y: false };
  return { a11y: localStorage.getItem(STORAGE_A11Y) === "1" };
})();
const uiStore = createStore(initialA11y);

export const ui = {
  toggleA11y: () => {
    const next = !uiStore.get().a11y;
    localStorage.setItem(STORAGE_A11Y, next ? "1" : "0");
    document.documentElement.classList.toggle("a11y", next);
    uiStore.set({ a11y: next });
  },
  initA11y: () => {
    if (uiStore.get().a11y) document.documentElement.classList.add("a11y");
  },
};
export const useA11y = () => useStore(uiStore, (s) => s.a11y);

/* -------------------- Theme -------------------- */
export type Theme = "light" | "dark" | "night";
const initialTheme: { theme: Theme } = (() => {
  if (typeof window === "undefined") return { theme: "dark" };
  const t = (localStorage.getItem(STORAGE_THEME) as Theme | null) ?? "dark";
  return { theme: t };
})();
const themeStore = createStore<{ theme: Theme }>(initialTheme);

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark", "theme-night");
  root.classList.add(`theme-${t}`);
}

export const theme = {
  set: (t: Theme) => {
    localStorage.setItem(STORAGE_THEME, t);
    applyTheme(t);
    themeStore.set({ theme: t });
  },
  init: () => applyTheme(themeStore.get().theme),
  cycle: () => {
    const order: Theme[] = ["dark", "night", "light"];
    const cur = themeStore.get().theme;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    theme.set(next);
  },
};
export const useTheme = () => useStore(themeStore, (s) => s.theme);

/* -------------------- Language -------------------- */
const initialLang: { lang: Lang } = (() => {
  if (typeof window === "undefined") return { lang: "en" };
  const l = (localStorage.getItem(STORAGE_LANG) as Lang | null) ?? "en";
  return { lang: l };
})();
const langStore = createStore<{ lang: Lang }>(initialLang);

export const i18n = {
  set: (l: Lang) => {
    localStorage.setItem(STORAGE_LANG, l);
    document.documentElement.lang = l;
    langStore.set({ lang: l });
  },
  toggle: () => i18n.set(langStore.get().lang === "en" ? "am" : "en"),
  init: () => { document.documentElement.lang = langStore.get().lang; },
};
export const useLang = () => useStore(langStore, (s) => s.lang);
export function t(key: TKey, vars?: Record<string, string | number>): string {
  const lang = langStore.get().lang;
  let s = (dict[lang] as Record<string, string>)[key] ?? (dict.en as Record<string, string>)[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
export const useT = () => {
  useLang(); // re-render on lang change
  return t;
};

/* -------------------- Currency -------------------- */
export type Currency = "ETB" | "USD";
const ETB_PER_USD = 128; // demo conversion
const initialCcy: { ccy: Currency } = (() => {
  if (typeof window === "undefined") return { ccy: "ETB" };
  return { ccy: (localStorage.getItem(STORAGE_CCY) as Currency | null) ?? "ETB" };
})();
const ccyStore = createStore<{ ccy: Currency }>(initialCcy);
export const currency = {
  set: (c: Currency) => { localStorage.setItem(STORAGE_CCY, c); ccyStore.set({ ccy: c }); },
  toggle: () => currency.set(ccyStore.get().ccy === "ETB" ? "USD" : "ETB"),
  convert: (etb: number) => ccyStore.get().ccy === "USD" ? etb / ETB_PER_USD : etb,
  symbol: () => ccyStore.get().ccy === "USD" ? "$" : "ETB ",
};
export const useCurrency = () => useStore(ccyStore, (s) => s.ccy);