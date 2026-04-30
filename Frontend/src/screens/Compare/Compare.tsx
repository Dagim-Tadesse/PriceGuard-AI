import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/services/priceService";
import ProductSelect from "@/components/ProductSelect";
import LocationBars from "@/components/charts/LocationBars";
import EmptyState from "@/components/feedback/EmptyState";
import Loader from "@/components/feedback/Loader";
import MetricCard from "@/components/cards/MetricCard";
import { Scale, MapPin, Trophy, ArrowDownUp, Globe2 } from "lucide-react";
import { fmtPrice } from "@/utils/format";
import { regionFor } from "@/utils/region";
import { useT } from "@/state/stores";
import { categoryFor, confidenceLabel, lowDataWarning, sourceLabel, aggregationHint, externalFactorNote } from "@/utils/trust";

export default function Compare() {
  const t = useT();
  const [product, setProduct] = useState("");
  const { data: history, isLoading } = useQuery({
    queryKey: ["history", product], queryFn: () => getHistory(product), enabled: !!product,
  });

  const { latestByLoc, regionRows, cheapest, gap, locCount, category, confidenceText, source, dataWarning, aggregationText } = useMemo(() => {
    const result = { latestByLoc: [] as { location: string; price: number; date: string }[], regionRows: [] as any[], cheapest: null as any, gap: 0, locCount: 0 };
    if (!history?.length) {
      return { ...result, category: product ? categoryFor(product) : "Food", confidenceText: "Low", source: product ? sourceLabel(product) : "Simulated Demo Data", dataWarning: lowDataWarning(0), aggregationText: "No confirmed reports yet" };
    }
    const map = new Map<string, { price: number; date: string }>();
    for (const r of history) {
      const cur = map.get(r.location);
      if (!cur || new Date(r.date) > new Date(cur.date)) map.set(r.location, { price: r.price, date: r.date });
    }
    const latest = Array.from(map.entries()).map(([location, v]) => ({ location, ...v }));
    const prices = latest.map(l => l.price);
    const cheap = latest.reduce((a, b) => (a.price < b.price ? a : b), latest[0]);

    const byRegion = new Map<string, number[]>();
    for (const l of latest) {
      const reg = regionFor(l.location);
      const cur = byRegion.get(reg) ?? [];
      cur.push(l.price); byRegion.set(reg, cur);
    }
    const regions = Array.from(byRegion.entries()).map(([region, arr]) => ({
      region, count: arr.length,
      avg: Math.round(arr.reduce((a,b)=>a+b,0)/arr.length),
      min: Math.min(...arr), max: Math.max(...arr),
    }));

    return {
      latestByLoc: latest.sort((a,b)=>a.price-b.price),
      regionRows: regions.sort((a,b)=>a.avg-b.avg),
      cheapest: cheap,
      gap: prices.length ? Math.max(...prices) - Math.min(...prices) : 0,
      locCount: latest.length,
      category: product ? categoryFor(product) : "Food",
      confidenceText: confidenceLabel(Math.min(1, Math.max(0, 0.45 + latest.length * 0.12))),
      source: product ? sourceLabel(product) : "Simulated Demo Data",
      dataWarning: lowDataWarning(latest.length),
      aggregationText: aggregationHint(history),
    };
  }, [history]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">{t("compare.tag")}</div>
          <h1 className="font-display text-4xl font-bold">{t("compare.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("compare.sub")}</p>
        </div>
        <div className="w-full max-w-sm"><ProductSelect value={product} onChange={setProduct} /></div>
      </header>

      {!product ? (
        <EmptyState icon={Scale} title="Pick a product to compare" description="We'll surface the best location and regional spread." />
      ) : isLoading ? <Loader /> : !history?.length ? (
        <EmptyState icon={Scale} title="No data to compare yet" />
      ) : (
        <>
          <div className="panel p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">{source}</span>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary">{category}</span>
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">{aggregationText}</span>
              <span className="px-2.5 py-1 rounded-full bg-secondary border border-border">{confidenceText} confidence</span>
            </div>
            <p className="text-muted-foreground">{dataWarning}</p>
          </div>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Locations Tracked" value={locCount} icon={MapPin} delay={0} />
            <MetricCard label="Cheapest Location" value={cheapest?.location ?? "—"} icon={Trophy} highlight hint={cheapest ? fmtPrice(cheapest.price) : ""} delay={100} />
            <MetricCard label="Price Gap" value={fmtPrice(gap)} icon={ArrowDownUp} delay={200} />
          </section>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Latest price by location</h2>
            <LocationBars data={latestByLoc.map(l => ({ label: l.location, value: l.price }))} />
          </div>

          <div className="panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />
              <span className="font-display font-semibold">Region overview</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase font-mono text-muted-foreground bg-secondary/30">
                  <tr>
                    <th className="text-left px-6 py-3">Region</th>
                    <th className="text-right px-6 py-3">Locations</th>
                    <th className="text-right px-6 py-3">Avg</th>
                    <th className="text-right px-6 py-3">Min</th>
                    <th className="text-right px-6 py-3">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {regionRows.map((r, i) => (
                    <tr key={r.region} className="border-t border-border/50 hover:bg-secondary/30 transition">
                      <td className="px-6 py-3">
                        {r.region}
                        {i === 0 && <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-primary">cheapest</span>}
                        {i === regionRows.length - 1 && regionRows.length > 1 && <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-warning">priciest</span>}
                      </td>
                      <td className="px-6 py-3 text-right">{r.count}</td>
                      <td className="px-6 py-3 text-right font-mono tabular">{fmtPrice(r.avg)}</td>
                      <td className="px-6 py-3 text-right font-mono tabular text-primary">{fmtPrice(r.min)}</td>
                      <td className="px-6 py-3 text-right font-mono tabular text-warning">{fmtPrice(r.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Region average comparison</h2>
            <LocationBars data={regionRows.map(r => ({ label: r.region.replace("Addis Ababa - ", "AA-"), value: r.avg }))} />
          </div>

          <div className="panel p-5 border-primary/20 bg-primary/5 text-sm leading-relaxed">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-2">Category mode</div>
            <p>
              {category} products are compared together here, so the view still stays useful when item-level data is thin.
            </p>
            <p className="mt-2 text-muted-foreground">{externalFactorNote()}</p>
          </div>
        </>
      )}
    </div>
  );
}
