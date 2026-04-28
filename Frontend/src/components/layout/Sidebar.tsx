import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, History, Scale, Activity, LogOut, Star, X, Brain } from "lucide-react";
import { auth, useAuth, useWatchlist, watchlist, ui, useA11y, useT } from "@/state/stores";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";

const NAV = [
  { to: "/", key: "nav.dashboard" as const, icon: LayoutDashboard },
  { to: "/insights", key: "nav.insights" as const, icon: Brain },
  { to: "/add-price", key: "nav.addPrice" as const, icon: PlusCircle },
  { to: "/history", key: "nav.history" as const, icon: History },
  { to: "/compare", key: "nav.compare" as const, icon: Scale },
  { to: "/detail", key: "nav.detail" as const, icon: Activity },
];

export default function Sidebar() {
  const { user } = useAuth();
  const items = useWatchlist();
  const a11y = useA11y();
  const t = useT();

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))]/80 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="relative p-6 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
          <Activity className="size-5 text-primary" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">PriceGuard</div>
          <div className="font-display font-semibold text-primary glow-text">AI</div>
        </div>
      </div>

      <nav className="relative flex-1 px-4 py-2 space-y-1">
        {NAV.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent"
              }`
            }
          >
            <Icon className="size-4 group-hover:scale-110 transition-transform" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="relative px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("common.watchlist")}</div>
          {items.length > 0 && (
            <button
              onClick={() => watchlist.clear()}
              className="text-xs text-muted-foreground hover:text-destructive transition"
            >{t("common.clear")}</button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground/70 italic">{t("common.empty.watch")}</div>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((p) => (
              <li key={p} className="flex items-center justify-between text-sm group animate-fade-in">
                <span className="flex items-center gap-2 text-foreground/80 truncate">
                  <Star className="size-3 text-primary fill-primary" /> {p}
                </span>
                <button onClick={() => watchlist.remove(p)} className="opacity-0 group-hover:opacity-100 transition">
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative px-6 py-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("common.theme")}</div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("common.language")}</div>
          <LangToggle />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("common.accessibility")}</div>
          <Switch checked={a11y} onCheckedChange={() => ui.toggleA11y()} />
        </div>
      </div>

      {user && (
        <div className="relative px-6 py-4 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-primary font-mono uppercase tracking-wider">{user.role}</div>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="size-9 rounded-lg border border-border hover:border-destructive hover:text-destructive transition flex items-center justify-center"
            aria-label={t("common.signout")}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}