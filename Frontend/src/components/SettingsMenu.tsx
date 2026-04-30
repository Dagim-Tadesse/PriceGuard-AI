import { useState } from "react";
import { MoreHorizontal, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { Switch } from "@/components/ui/switch";
import { useT, ui, auth, watchlist, useA11y } from "@/state/stores";

export default function SettingsMenu() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const a11y = useA11y();

  return (
    <div className="relative z-[60]">
      <button
        onClick={() => setOpen((s) => !s)}
        className="size-9 rounded-lg border border-border bg-surface/60 flex items-center justify-center hover:border-primary/40 transition"
        aria-label="Open settings"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-background p-3 shadow-lg z-[80]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase text-muted-foreground">{t("common.theme")}</div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase text-muted-foreground">{t("common.language")}</div>
              <LangToggle />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase text-muted-foreground">{t("common.accessibility")}</div>
              <Switch checked={a11y} onCheckedChange={() => ui.toggleA11y()} />
            </div>

            <div className="border-t border-border pt-2 flex items-center justify-between">
              <button onClick={() => { watchlist.clear(); setOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground">{t("common.clear")}</button>
              <button onClick={() => { auth.signOut(); setOpen(false); }} className="flex items-center gap-2 text-sm text-destructive hover:underline"><LogOut className="size-4" />{t("common.signout")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
