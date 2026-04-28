import { useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getHistory, getPrices } from "@/services/priceService";
import MetricCard from "@/components/cards/MetricCard";
import PriceCard from "@/components/cards/PriceCard";
import EmptyState from "@/components/feedback/EmptyState";
import Loader from "@/components/feedback/Loader";
import ErrorBanner from "@/components/feedback/ErrorBanner";
import { Boxes, TrendingUp, Zap, MapPin, Search, AlertTriangle } from "lucide-react";
import { useAuth, auth, useT, currency, useCurrency } from "@/state/stores";
import type { Role } from "@/types/api";
import { computeAlerts } from "@/utils/alerts";
import { fmtPrice } from "@/utils/format";
import ParticleField from "@/components/ParticleField";

const ROLE_KEY: Record<Role, { t: any; s: any }> = {
  Buyer: { t: "hero.buyer.title", s: "hero.buyer.sub" },
  Seller: { t: "hero.seller.title", s: "hero.seller.sub" },
  Admin:  { t: "hero.admin.title",  s: "hero.admin.sub"  },
};

export default function Dashboard() {
  const t = useT();
  useCurrency();
  const { user } = useAuth();
  const role = user?.role ?? "Buyer";
  const { data: prices, isLoading, error } = useQuery({ queryKey: ["prices"], queryFn: getPrices });

  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState("all");
  const [trend, setTrend] = useState("all");

  const list = prices ?? [];
  const locations = useMemo(() => Array.from(new Set(list.map((p) => p.location))), [list]);

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          (!search || p.product.toLowerCase().includes(search.toLowerCase())) &&
          (loc === "all" || p.location === loc) &&
          (trend === "all" || p.trend === trend),
      ),
    [list, search, loc, trend],
  );

  const tracked = list.length;
  const rising = list.filter((p) => p.trend === "increasing").length;
  const buyNow = list.filter((p) => p.action === "buy_now").length;
  const regions = new Set(list.map((p) => p.location)).size;

  // Alerts: fetch history for first few products
  const alertQueries = useQueries({
    queries: list.slice(0, 6).map((p) => ({
      queryKey: ["history", p.product],
      queryFn: () => getHistory(p.product),
    })),
  });
  const alerts = alertQueries
    .map((q) => (q.data ? computeAlerts(q.data) : null))
    .filter(Boolean)
    .slice(0, 3) as NonNullable<ReturnType<typeof computeAlerts>>[];

  const k = ROLE_KEY[role];
  const title = t(k.t);
  const sub = t(k.s);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative panel-elevated p-8 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <ParticleField count={45} />
        <div className="absolute -top-32 -right-32 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {t("hero.live", { role })}
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
              {title.split(" ").map((w, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "text-primary glow-text" : ""}>
                  {w}{" "}
                </span>
              ))}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl">{sub}</p>
          </div>
          <div className="flex gap-2">
            {(["Buyer", "Seller", "Admin"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => auth.setRole(r)}
                className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition ${
                  role === r
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && <ErrorBanner message={(error as any).friendly ?? String(error)} />}

      {/* KPIs */}
      <section className={`grid gap-5 ${role === "Admin" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-3"}`}>
        {role === "Seller" ? (
          <>
            <MetricCard label={t("kpi.tracked")} value={tracked} icon={Boxes} delay={0} animate />
            <MetricCard label={t("kpi.rising")} value={rising} icon={TrendingUp} highlight hint={t("kpi.demand")} delay={100} animate />
            <MetricCard label={t("kpi.alerts")} value={alerts.length} icon={AlertTriangle} delay={200} animate />
          </>
        ) : (
          <>
            <MetricCard label={t("kpi.tracked")} value={tracked} icon={Boxes} delay={0} animate />
            <MetricCard label={t("kpi.increasing")} value={rising} icon={TrendingUp} delay={100} animate />
            <MetricCard label={t("kpi.buyNow")} value={buyNow} icon={Zap} highlight hint={t("kpi.actToday")} delay={200} animate />
            {role === "Admin" && (
              <MetricCard label={t("kpi.regions")} value={regions} icon={MapPin} delay={300} animate />
            )}
          </>
        )}
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="space-y-2 animate-fade-in">
          {alerts.map((a) => (
            <div key={a.product} className="panel p-4 flex items-center gap-3 border-warning/40 bg-warning/5">
              <AlertTriangle className="size-5 text-warning shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">{a.product}</span> {t("alert.jumped")}{" "}
                <span className="text-warning font-mono">+{(a.pctChange * 100).toFixed(1)}%</span>{" "}
                <span className="text-muted-foreground">
                  ({currency.symbol()}{fmtPrice(currency.convert(a.from))} → {currency.symbol()}{fmtPrice(currency.convert(a.to))})
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition"
          />
        </div>
        <select
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="all">{t("common.allLocations")}</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={trend}
          onChange={(e) => setTrend(e.target.value)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="all">{t("common.allTrends")}</option>
          <option value="increasing">{t("trend.increasing")}</option>
          <option value="decreasing">{t("trend.decreasing")}</option>
          <option value="stable">{t("trend.stable")}</option>
        </select>
      </section>

      {/* Cards */}
      {isLoading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No products match your filters"
          description="Try clearing filters or adding new prices."
        />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <PriceCard key={p.product + p.location} item={p} delay={i * 60} />
          ))}
        </section>
      )}
    </div>
  );
}