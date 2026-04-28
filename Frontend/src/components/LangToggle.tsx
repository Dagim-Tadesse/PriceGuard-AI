import { Languages } from "lucide-react";
import { i18n, useLang } from "@/state/stores";

export default function LangToggle() {
  const lang = useLang();
  return (
    <button
      onClick={() => i18n.toggle()}
      className="flex items-center gap-2 px-3 h-9 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition group"
      title={lang === "en" ? "Switch to Amharic" : "Switch to English"}
    >
      <Languages className="size-3.5 text-primary" />
      <span className="font-mono text-xs uppercase tracking-wider">
        <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
        <span className="text-muted-foreground mx-1">/</span>
        <span className={lang === "am" ? "text-primary" : "text-muted-foreground"}>አማ</span>
      </span>
    </button>
  );
}