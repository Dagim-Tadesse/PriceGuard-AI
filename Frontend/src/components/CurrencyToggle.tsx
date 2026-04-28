import { DollarSign } from "lucide-react";
import { currency, useCurrency } from "@/state/stores";

export default function CurrencyToggle() {
  const c = useCurrency();
  return (
    <button
      onClick={() => currency.toggle()}
      className="flex items-center gap-2 px-3 h-9 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition"
      title="Toggle currency"
    >
      <DollarSign className="size-3.5 text-primary" />
      <span className="font-mono text-xs uppercase tracking-wider">
        <span className={c === "ETB" ? "text-primary" : "text-muted-foreground"}>ETB</span>
        <span className="text-muted-foreground mx-1">/</span>
        <span className={c === "USD" ? "text-primary" : "text-muted-foreground"}>USD</span>
      </span>
    </button>
  );
}