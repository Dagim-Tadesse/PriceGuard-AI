import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPrices } from "@/services/priceService";
import { Sparkles, TrendingUp, AlertTriangle, Package, Brain, Lightbulb } from "lucide-react";
import Loader from "@/components/feedback/Loader";
import { useT } from "@/state/stores";
import { fmtPrice } from "@/utils/format";
import ParticleField from "@/components/ParticleField";

export default function Insights() {
  const t = useT();
  const { data, isLoading } = useQuery({ queryKey: ["prices"], queryFn: getPrices });
  const list = data ?? [];

  const insights = useMemo(() => {
    const rising = list.filter(p => p.trend === "increasing");
    const falling = list.filter(p => p.trend === "decreasing");
    const buyNow = list.filter(p => p.action === "buy_now");
    const cheapest = [...list].sort((a, b) => a.price - b.price)[0];
    const bundle = falling.slice(0, 3).map(p => p.product);
    return { rising, falling, buyNow, cheapest, bundle };
  }, [list]);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="relative panel-elevated p-8 overflow-hidden">
        <ParticleField count={50} />
        <div className="absolute -top-32 -right-32 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
            <Brain className="size-3.5" /> {t("insights.tag")}
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
            {t("insights.title").split(" ").map((w, i, arr) => (
              <span key={i} className={i === arr.length - 1 ? "text-primary glow-text" : ""}>{w} </span>
            ))}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">{t("insights.sub")}</p>
        </div>
      </header>

      <section className="panel-elevated p-6 border-primary/30">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-primary mb-4">
          <Sparkles className="size-3.5" /> {t("insights.summary")}
        </div>
        <p className="text-base leading-relaxed">
          The market shows <span className="text-warning font-semibold">{insights.rising.length} rising</span> and{" "}
          <span className="text-primary font-semibold">{insights.falling.length} softening</span> products today.
          We detected <span className="text-primary font-semibold">{insights.buyNow.length} buy-now signals</span>.
          {insights.cheapest && (<>
            {" "}Cheapest tracked: <span className="font-semibold">{insights.cheapest.product}</span> at{" "}
            <span className="font-mono text-primary">{fmtPrice(insights.cheapest.price)}</span>.
          </>)}
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="panel p-6 hover:border-primary/40 transition group">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Lightbulb className="size-4 text-primary" />
            </div>
            <div className="font-display font-semibold">{t("insights.opportunities")}</div>
          </div>
          <ul className="space-y-2">
            {insights.falling.slice(0, 5).map(p => (
              <li key={p.product} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                <span>{p.product}</span>
                <span className="font-mono text-primary tabular">{fmtPrice(p.price)}</span>
              </li>
            ))}
            {insights.falling.length === 0 && <li className="text-sm text-muted-foreground italic">No softening prices right now.</li>}
          </ul>
        </div>

        <div className="panel p-6 border-warning/20 hover:border-warning/40 transition">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 rounded-xl bg-warning/15 flex items-center justify-center">
              <AlertTriangle className="size-4 text-warning" />
            </div>
            <div className="font-display font-semibold">{t("insights.risks")}</div>
          </div>
          <ul className="space-y-2">
            {insights.rising.slice(0, 5).map(p => (
              <li key={p.product} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                <span className="flex items-center gap-2"><TrendingUp className="size-3 text-warning" /> {p.product}</span>
                <span className="font-mono text-warning tabular">{fmtPrice(p.price)}</span>
              </li>
            ))}
            {insights.rising.length === 0 && <li className="text-sm text-muted-foreground italic">All clear.</li>}
          </ul>
        </div>
      </section>

      {insights.bundle.length > 0 && (
        <section className="panel-elevated p-6 border-primary/30 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 size-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-primary mb-3">
              <Package className="size-3.5" /> {t("insights.bundle")}
            </div>
            <p className="text-base mb-4">Buy these together while prices are soft:</p>
            <div className="flex flex-wrap gap-2">
              {insights.bundle.map(b => (
                <span key={b} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-sm font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}