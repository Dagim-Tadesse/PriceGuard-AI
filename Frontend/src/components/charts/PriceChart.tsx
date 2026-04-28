import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PriceRecord } from "@/types/api";
import { fmtDay, fmtPrice } from "@/utils/format";

interface Props { data: PriceRecord[]; height?: number }

export default function PriceChart({ data, height = 260 }: Props) {
  // average per day
  const byDay = new Map<string, { sum: number; n: number; date: string }>();
  for (const r of data) {
    const k = new Date(r.date).toISOString().slice(0, 10);
    const cur = byDay.get(k) ?? { sum: 0, n: 0, date: r.date };
    cur.sum += r.price; cur.n += 1; byDay.set(k, cur);
  }
  const series = Array.from(byDay.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((v) => ({ date: fmtDay(v.date), price: Math.round(v.sum / v.n) }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="pg-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(168 85% 52%)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(168 85% 52%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(180 25% 14%)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(180 10% 55%)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(180 10% 55%)" fontSize={11} tickLine={false} axisLine={false}
                 tickFormatter={(v) => fmtPrice(v as number)} width={70} />
          <Tooltip
            contentStyle={{
              background: "hsl(175 45% 7%)",
              border: "1px solid hsl(168 85% 52% / 0.4)",
              borderRadius: 12,
              boxShadow: "0 0 30px hsl(168 85% 52% / 0.25)",
              color: "hsl(180 15% 92%)",
              fontSize: 12,
            }}
            formatter={(v) => [fmtPrice(v as number), "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke="hsl(168 85% 52%)" strokeWidth={2}
                fill="url(#pg-area)" activeDot={{ r: 5, fill: "hsl(168 100% 60%)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
