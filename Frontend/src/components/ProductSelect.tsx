import { useQuery } from "@tanstack/react-query";
import { getPrices } from "@/services/priceService";
import { Boxes } from "lucide-react";

interface Props { value: string; onChange: (v: string) => void; placeholder?: string }

export default function ProductSelect({ value, onChange, placeholder = "Select a product…" }: Props) {
  const { data } = useQuery({ queryKey: ["prices"], queryFn: getPrices });
  const products = Array.from(new Set((data ?? []).map((p) => p.product)));

  return (
    <div className="relative">
      <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition appearance-none"
      >
        <option value="">{placeholder}</option>
        {products.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}
