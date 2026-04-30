import type { PriceSummary } from "@/types/api";
import { TrendingUp, TrendingDown, Minus, Star, MapPin, BadgeCheck, AlertTriangle, Users } from "lucide-react";
import { fmtPrice } from "@/utils/format";
import { useWatchlist, watchlist, useT, currency, useCurrency, contrib } from "@/state/stores";
import { useNavigate } from "react-router-dom";
import Sparkline from "@/components/charts/Sparkline";
import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/services/priceService";
import { aggregationHint, categoryFor, confirmationLabel, confidenceLabel, lowDataWarning, outlierWarning, sourceLabel } from "@/utils/trust";
import { toast } from "sonner";

interface Props { item: PriceSummary; delay?: number }

export default function PriceCard({ item, delay = 0 }: Props) {
  const t = useT();
  useCurrency();
  const items = useWatchlist();
  const watched = items.includes(item.product);
  const navigate = useNavigate();
  const { data: history } = useQuery({ queryKey: ["history", item.product], queryFn: () => getHistory(item.product) });

  const category = item.category ?? categoryFor(item.product);
  const source = item.source ?? sourceLabel(item.product);
  const trustHistory = history ?? [];
  const confirmed = confirmationLabel(trustHistory);
  const dataHint = aggregationHint(trustHistory);
  const lowData = lowDataWarning(trustHistory.length);
  const anomaly = outlierWarning(trustHistory);
  const trustLevel = trustHistory.length >= 6 ? "High" : trustHistory.length >= 3 ? "Medium" : "Low";

  const TIcon = item.trend === "increasing" ? TrendingUp : item.trend === "decreasing" ? TrendingDown : Minus;
  const trendColor =
    item.trend === "increasing" ? "text-warning"
    : item.trend === "decreasing" ? "text-primary"
    : "text-muted-foreground";

  const isBuy = item.action === "buy_now";

  return (
    <div
      className="group relative panel p-6 overflow-hidden hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow animate-slide-up cursor-pointer"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
      onClick={() => navigate(`/detail?product=${encodeURIComponent(item.product)}`)}
    >
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-lg truncate pr-2">{item.product}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="size-3" /> {item.location}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); watchlist.toggle(item.product); }}
          className="shrink-0 p-1.5 rounded-lg hover:bg-secondary transition"
          aria-label="Toggle watchlist"
        >
          <Star className={`size-4 transition ${watched ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-[0.18em]">
        <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">{category}</span>
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/25">{source}</span>
        <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border flex items-center gap-1">
          <Users className="size-3" /> {confirmed}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">{trustLevel} trust</span>
      </div>

      {(lowData || anomaly) && (
        <div className="space-y-1.5 mb-4">
          {lowData && (
            <div className="flex items-center gap-1.5 text-[11px] text-warning font-medium">
              <AlertTriangle className="size-3.5" /> {lowData}
            </div>
          )}
          {anomaly && (
            <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
              <BadgeCheck className="size-3.5" /> {anomaly}
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">{dataHint}</div>
        </div>
      )}

      <div className="relative flex items-end justify-between mb-4">
        <div>
          <div className="text-3xl font-display font-bold tabular">{currency.symbol()}{fmtPrice(currency.convert(item.price))}</div>
          <div className={`flex items-center gap-1 text-xs font-mono uppercase tracking-wider mt-1 ${trendColor}`}>
            <TIcon className="size-3" /> {t(("trend." + item.trend) as any)}
          </div>
        </div>
        <div className="w-24 h-12">
          <Sparkline trend={item.trend} />
        </div>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider ${
              isBuy
                ? "bg-primary/15 text-primary border border-primary/40 animate-pulse-glow"
                : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            {isBuy ? `● ${t("common.buyNow")}` : t("common.wait")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const total = contrib.award(5);
              toast.success(`Confirmed price +5 points (${total} total)`);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 transition"
          >
            Confirm price
          </button>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-primary transition">
          {t("common.viewDetail")}
        </span>
      </div>
    </div>
  );
}
