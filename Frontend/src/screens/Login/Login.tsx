import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/state/stores";
import type { Role } from "@/types/api";
import { Activity, ShieldCheck, ShoppingCart, Store, Crown } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/state/stores";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";

const ACCOUNTS: { name: string; role: Role; icon: any; tagline: string }[] = [
  { name: "Buyer Demo", role: "Buyer", icon: ShoppingCart, tagline: "Find the smartest moment to buy." },
  { name: "Seller Demo", role: "Seller", icon: Store, tagline: "Spot rising demand before competitors." },
  { name: "Admin Demo", role: "Admin", icon: Crown, tagline: "Monitor every market signal." },
];

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number>(0);
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== "priceguard") {
      toast.error("Invalid password. Use: priceguard");
      return;
    }
    const acc = ACCOUNTS[selected];
    auth.signIn(acc.name, acc.role);
    toast.success(`Welcome, ${acc.name}`);
    navigate("/");
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {t("login.tag")}
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight">
            {t("login.title1")} <span className="text-primary glow-text">{t("login.buy")}</span>.
            <br />
            {t("login.title2")} <span className="text-warning">{t("login.wait")}</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">{t("login.sub")}</p>
          <div className="flex items-center gap-6 pt-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-2"><Activity className="size-4 text-primary" /> {t("login.live")}</div>
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> {t("login.demo")}</div>
          </div>
        </div>

        <form onSubmit={submit} className="panel-elevated p-8 space-y-6 animate-scale-in shadow-glow">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {t("login.choose")}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ACCOUNTS.map((a, i) => {
                const Icon = a.icon;
                const active = selected === i;
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`group flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      active
                        ? "border-primary/50 bg-primary/10 shadow-glow"
                        : "border-border bg-surface hover:border-primary/30"
                    }`}
                  >
                    <div className={`size-10 rounded-lg flex items-center justify-center ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.tagline}</div>
                    </div>
                    <div className={`text-[10px] font-mono uppercase tracking-wider ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}>{a.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("login.access")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="priceguard"
              className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary/60 focus:shadow-glow transition"
            />
            <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">{t("login.demoPwd")}</div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary-glow transition-all hover:shadow-glow-strong active:scale-[0.98]"
          >
            {t("login.cta")}
          </button>
        </form>
      </div>
    </div>
  );
}