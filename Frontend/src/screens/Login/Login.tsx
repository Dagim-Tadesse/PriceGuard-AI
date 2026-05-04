import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useT, contrib } from "@/state/stores";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { signInWithPassword } from "@/services/authService";

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await signInWithPassword(email, password);
      const awarded = contrib.awardDailyBonus();
      toast.success(`Welcome, ${profile.name}`);
      if (awarded) toast.success("Daily activity bonus +5 points");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not sign in");
    } finally {
      setLoading(false);
    }
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
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Email</label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-glow transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-glow transition"
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">Your saved role is loaded automatically after signin.</div>
          </div>

          <div className="text-sm text-center">
            <a href="/signup" className="text-primary">Create an account</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary-glow transition-all hover:shadow-glow-strong active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Signing in…" : t("login.cta")}
          </button>
        </form>
      </div>
    </div>
  );
}