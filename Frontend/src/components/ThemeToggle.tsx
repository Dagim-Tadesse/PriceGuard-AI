import { Sun, Moon, Sparkles } from "lucide-react";
import { theme, useTheme, type Theme } from "@/state/stores";

const opts: { v: Theme; icon: any; label: string }[] = [
  { v: "light", icon: Sun, label: "Light" },
  { v: "dark", icon: Moon, label: "Dark" },
  { v: "night", icon: Sparkles, label: "Night" },
];

export default function ThemeToggle() {
  const cur = useTheme();
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border">
      {opts.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          onClick={() => theme.set(v)}
          aria-label={label}
          title={label}
          className={`flex items-center justify-center size-7 rounded-lg transition-all ${
            cur === v
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}