import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { fmtPrice } from "@/utils/format";

interface Datum { label: string; value: number }
interface Props { data: Datum[]; height?: number }

export default function LocationBars({ data, height = 260 }: Props) {
  const min = Math.min(...data.map(d => d.value));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <CartesianGrid stroke="hsl(180 25% 14%)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" stroke="hsl(180 10% 55%)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(180 10% 55%)" fontSize={11} tickLine={false} axisLine={false}
                 tickFormatter={(v) => fmtPrice(v as number)} width={70} />
          <Tooltip
            cursor={{ fill: "hsl(168 85% 52% / 0.08)" }}
            contentStyle={{
              background: "hsl(175 45% 7%)",
              border: "1px solid hsl(168 85% 52% / 0.4)",
              borderRadius: 12,
              color: "hsl(180 15% 92%)",
              fontSize: 12,
            }}
            formatter={(v) => [fmtPrice(v as number), "Price"]}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.value === min ? "hsl(168 85% 52%)" : "hsl(168 85% 52% / 0.35)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
