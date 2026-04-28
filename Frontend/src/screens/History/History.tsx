import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistory, getPrediction } from "@/services/priceService";
import ProductSelect from "@/components/ProductSelect";
import PriceChart from "@/components/charts/PriceChart";
import EmptyState from "@/components/feedback/EmptyState";
import Loader from "@/components/feedback/Loader";
import MetricCard from "@/components/cards/MetricCard";
import { History as HistoryIcon, TrendingUp, Target, Zap, Gauge } from "lucide-react";
import { fmtDate, fmtPrice, pct } from "@/utils/format";
import { useT } from "@/state/stores";

export default function History() {
  const t = useT();
  const [product, setProduct] = useState("");
  const { data: history, isLoading } = useQuery({
    queryKey: ["history", product], queryFn: () => getHistory(product), enabled: !!product,
  });
  const { data: pred } = useQuery({
    queryKey: ["prediction", product], queryFn: () => getPrediction(product), enabled: !!product,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">{t("history.tag")}</div>
          <h1 className="font-display text-4xl font-bold">{t("history.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("history.sub")}</p>
        </div>
        <div className="w-full max-w-sm">
          <ProductSelect value={product} onChange={setProduct} />
        </div>
      </header>

      {!product ? (
        <EmptyState icon={HistoryIcon} title="Pick a product to begin" description="Select any tracked product to view its full price history and AI prediction." />
      ) : isLoading ? <Loader /> : !history?.length ? (
        <EmptyState icon={HistoryIcon} title="No history yet for this product" />
      ) : (
        <>
          {pred && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Trend" value={String(pred.trend)} icon={TrendingUp} delay={0} />
              <MetricCard label="Predicted Price" value={pred.predicted_price ? fmtPrice(pred.predicted_price) : "—"} icon={Target} delay={80} highlight />
              <MetricCard label="Action" value={String(pred.action).replace("_", " ").toUpperCase()} icon={Zap} delay={160} />
              <MetricCard label="Confidence" value={pct(pred.confidence)} icon={Gauge} delay={240} />
            </section>
          )}

          {pred?.reason && (
            <div className="panel-elevated p-5 border-primary/30 animate-fade-in">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-2">Why this signal</div>
              <p className="text-sm leading-relaxed">{pred.reason}</p>
            </div>
          )}

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Price trajectory</h2>
            <PriceChart data={history} />
          </div>

          <div className="panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border font-display font-semibold">All observations</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground bg-secondary/30">
                  <tr><th className="text-left px-6 py-3">Date</th><th className="text-left px-6 py-3">Location</th><th className="text-right px-6 py-3">Price</th></tr>
                </thead>
                <tbody>
                  {[...history].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map((r) => (
                    <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30 transition">
                      <td className="px-6 py-3 text-muted-foreground">{fmtDate(r.date)}</td>
                      <td className="px-6 py-3">{r.location}</td>
                      <td className="px-6 py-3 text-right font-mono tabular">{fmtPrice(r.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
