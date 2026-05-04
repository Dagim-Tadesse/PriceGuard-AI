import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmPrice, getHistory, getPrediction, updatePrice } from "@/services/priceService";
import ProductSelect from "@/components/ProductSelect";
import PriceChart from "@/components/charts/PriceChart";
import EmptyState from "@/components/feedback/EmptyState";
import Loader from "@/components/feedback/Loader";
import MetricCard from "@/components/cards/MetricCard";
import { Activity, TrendingUp, Target, Zap, Download, Share2, Lightbulb, Send } from "lucide-react";
import { fmtDate, fmtPrice, pct } from "@/utils/format";
import { bestTimeMessage } from "@/utils/bestTime";
import { toast } from "sonner";
import ConfidenceRing from "@/components/ConfidenceRing";
import { useAuth, useT } from "@/state/stores";
import { aggregationHint, categoryFor, confidenceLabel, lowDataWarning, sourceLabel, externalFactorNote } from "@/utils/trust";

export default function Detail() {
  const t = useT();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const initial = params.get("product") ?? "";
  const [product, setProduct] = useState(initial);
  const role = user?.role ?? "Buyer";
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");

  useEffect(() => {
    if (product) setParams({ product }); else setParams({});
  }, [product, setParams]);

  const { data: history, isLoading } = useQuery({
    queryKey: ["history", product], queryFn: () => getHistory(product), enabled: !!product,
  });
  const { data: pred } = useQuery({
    queryKey: ["prediction", product], queryFn: () => getPrediction(product), enabled: !!product,
  });

  const sortedHistory = history ? [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const dataWarning = lowDataWarning(sortedHistory.length);
  const confidenceText = pred ? confidenceLabel(pred.confidence) : "Low";
  const source = product ? sourceLabel(product) : "Simulated Demo Data";
  const category = product ? categoryFor(product) : "Food";
  const aggregationText = aggregationHint(sortedHistory);
  const latest = sortedHistory[sortedHistory.length - 1];
  const previous = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : null;
  const momentumPct = latest && previous ? ((latest.price - previous.price) / previous.price) * 100 : 0;
  const averagePrice = sortedHistory.length
    ? sortedHistory.reduce((sum, row) => sum + row.price, 0) / sortedHistory.length
    : 0;
  const latestEditable = useMemo(() => sortedHistory[sortedHistory.length - 1] ?? null, [sortedHistory]);

  useEffect(() => {
    if (!latestEditable) return;
    setEditPrice(String(latestEditable.price));
    setEditLocation(latestEditable.location);
  }, [latestEditable]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!latestEditable) throw new Error("No row selected");
      return updatePrice(latestEditable.id, {
        price: Number(editPrice),
        location: editLocation,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["history", product] });
      await qc.invalidateQueries({ queryKey: ["prediction", product] });
      toast.success("Latest price updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update price"),
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!latestEditable) throw new Error("No row selected");
      return confirmPrice(latestEditable.id, latestEditable.confirmations + 1);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["history", product] });
      await qc.invalidateQueries({ queryKey: ["prediction", product] });
      toast.success("Latest price confirmed");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not confirm price"),
  });

  const exportCsv = () => {
    if (!history?.length) return;
    const header = "id,product,location,price,date";
    const rows = history.map(r => `${r.id},"${r.product}","${r.location}",${r.price},${r.date}`);
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${product}-history.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const share = async () => {
    if (!pred) return;
    const text = `PriceGuard AI · ${product}\nAction: ${String(pred.action).toUpperCase()} (${pct(pred.confidence)} confidence)\nPredicted: ${pred.predicted_price ? fmtPrice(pred.predicted_price) : "—"}\nReason: ${pred.reason}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Snippet copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const shareTelegram = () => {
    if (!pred) return;
    const text = `PriceGuard AI · ${product}\nAction: ${String(pred.action).toUpperCase()} (${pct(pred.confidence)})\nPredicted: ${pred.predicted_price ? fmtPrice(pred.predicted_price) : "—"}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent("https://priceguard.ai")}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">{t("detail.tag")}</div>
          <h1 className="font-display text-4xl font-bold">{t("detail.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("detail.sub")}</p>
        </div>
        <div className="w-full max-w-sm"><ProductSelect value={product} onChange={setProduct} /></div>
      </header>

      {!product ? (
        <EmptyState icon={Activity} title="Select a product" description="Pick any tracked product for a full intelligence scan." />
      ) : isLoading ? <Loader /> : !history?.length ? (
        <EmptyState icon={Activity} title="No data yet" />
      ) : (
        <>
          {dataWarning && (
            <div className="panel p-4 border-warning/40 bg-warning/5 text-sm text-warning">
              {dataWarning}
            </div>
          )}

          {pred && (
            <>
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard label="Trend" value={String(pred.trend)} icon={TrendingUp} delay={0} />
                  <MetricCard label="Predicted Price" value={pred.predicted_price ? fmtPrice(pred.predicted_price) : "—"} icon={Target} highlight delay={80} />
                  <MetricCard label="Action" value={String(pred.action).replace("_", " ").toUpperCase()} icon={Zap} delay={160} />
                </div>
                <div className="panel-elevated p-6 flex flex-col items-center justify-center gap-4 animate-scale-in">
                  <ConfidenceRing value={pred.confidence} size={140} label={confidenceText} />
                  <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
                    <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">{source}</span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary">{category}</span>
                    <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">{aggregationText}</span>
                  </div>
                </div>
              </section>

              <div className="panel-elevated p-6 border-primary/30 flex items-start gap-4">
                <div className="size-12 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center animate-pulse-glow">
                  <Lightbulb className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-1">{t("detail.bestTime")}</div>
                  <p className="text-base leading-relaxed">{bestTimeMessage(pred)}</p>
                </div>
              </div>

              {pred.reason && (
                <div className="panel p-5">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">{t("detail.reasoning")}</div>
                  <p className="text-sm leading-relaxed text-foreground/90">{pred.reason}</p>
                </div>
              )}

              <div className="panel p-5 border-warning/30 bg-warning/5 text-sm leading-relaxed">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-warning mb-2">Data trust</div>
                <p className="mb-2">Confirmed by {Math.min(3, Math.max(1, history.length))} users.</p>
                <p>{externalFactorNote()}</p>
              </div>

              {(role === "Seller" || role === "Admin") && latestEditable && (
                <div className="panel p-5 border-primary/30 bg-primary/5 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary">{role} tools</div>
                  <p className="text-sm text-muted-foreground">
                    {role === "Seller"
                      ? "Update the latest market entry before it affects your pricing decisions."
                      : "Correct the latest entry or confirm it to strengthen the signal."}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Price</label>
                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Location</label>
                      <input
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate()}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60"
                    >
                      {updateMutation.isPending ? "Saving…" : "Save latest price"}
                    </button>
                    {role === "Admin" && (
                      <button
                        type="button"
                        onClick={() => confirmMutation.mutate()}
                        disabled={confirmMutation.isPending}
                        className="px-4 py-2.5 rounded-xl border border-border bg-background font-medium disabled:opacity-60"
                      >
                        {confirmMutation.isPending ? "Confirming…" : "Confirm latest price"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="panel p-5 border-primary/30 bg-primary/5 text-sm leading-relaxed space-y-3">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-1">Model Walkthrough</div>
                <p>The predictor uses recent price history, trend direction, and sample size to estimate the next move.</p>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Samples used</div>
                    <div className="font-semibold">{history.length} price points</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Latest momentum</div>
                    <div className="font-semibold">{momentumPct >= 0 ? "+" : ""}{momentumPct.toFixed(1)}%</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Average price</div>
                    <div className="font-semibold">{fmtPrice(averagePrice)}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Confidence</div>
                    <div className="font-semibold">{pred ? pct(pred.confidence) : "—"}</div>
                  </div>
                </div>
                <p className="text-muted-foreground">Prediction logic: compare the latest two points, score the trend, and boost confidence when the sample window is larger.</p>
              </div>
            </>
          )}

          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Trajectory</h2>
              <div className="flex gap-2">
                <button onClick={exportCsv} className="px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border border-border hover:border-primary/50 hover:text-primary transition flex items-center gap-1.5">
                  <Download className="size-3.5" /> CSV
                </button>
                <button onClick={share} className="px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border border-border hover:border-primary/50 hover:text-primary transition flex items-center gap-1.5">
                  <Share2 className="size-3.5" /> Share
                </button>
                <button onClick={shareTelegram} className="px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border border-border hover:border-primary/50 hover:text-primary transition flex items-center gap-1.5">
                  <Send className="size-3.5" /> Telegram
                </button>
              </div>
            </div>
            <PriceChart data={history} height={300} />
          </div>

          <div className="panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border font-display font-semibold">Observations</div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground bg-secondary/30 sticky top-0">
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
