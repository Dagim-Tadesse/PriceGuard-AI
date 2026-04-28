import { useQuery } from "@tanstack/react-query";
import { getPrices } from "@/services/priceService";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmtPrice } from "@/utils/format";
import { currency, useCurrency } from "@/state/stores";

export default function Ticker() {
  useCurrency();
  const { data } = useQuery({ queryKey: ["prices"], queryFn: getPrices });
  const items = data ?? [];
  if (items.length === 0) return <div className="h-10" />;

  const Icon = (t: string) => t === "increasing" ? TrendingUp : t === "decreasing" ? TrendingDown : Minus;

  const row = (
    <div className="flex items-center gap-10 px-6">
      {items.map((p) => {
        const I = Icon(p.trend);
        const color = p.trend === "increasing" ? "text-warning" : p.trend === "decreasing" ? "text-primary" : "text-muted-foreground";
        return (
          <div key={p.product + p.location} className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-muted-foreground font-mono text-xs">{p.location.toUpperCase()}</span>
            <span className="font-medium">{p.product}</span>
            <span className="font-mono tabular text-foreground/90">{currency.symbol()}{fmtPrice(currency.convert(p.price))}</span>
            <I className={`size-3.5 ${color}`} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-10 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex items-center h-full animate-ticker w-max">{row}{row}</div>
    </div>
  );
}
