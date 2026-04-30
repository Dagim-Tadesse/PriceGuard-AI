import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPrice } from "@/services/priceService";
import { toast } from "sonner";
import { z } from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import ErrorBanner from "@/components/feedback/ErrorBanner";
import VoiceButton from "@/components/VoiceButton";
import { useT, useLang, contrib } from "@/state/stores";

const schema = z.object({
  product: z.string().trim().min(1, "Product is required").max(100),
  price: z.coerce.number().positive("Price must be > 0").max(10_000_000),
  location: z.string().trim().min(1, "Location is required").max(80),
});

export default function AddPrice() {
  const t = useT();
  const lang = useLang();
  const qc = useQueryClient();
  // Voice command parsing: "Teff Flour 25kg 4200 Bole"
  const handleVoice = (text: string) => {
    const m = text.match(/^(.+?)\s+(\d{2,7})\s+(.+)$/i);
    if (m) {
      setForm({ product: m[1].trim(), price: m[2], location: m[3].trim() });
    } else {
      setForm((f) => ({ ...f, product: text }));
    }
  };
  const [form, setForm] = useState({ product: "", price: "", location: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: addPrice,
    onSuccess: () => {
      const points = contrib.award(10);
      toast.success(`Price recorded ✓ (+10 points, ${points} total)`);
      qc.invalidateQueries({ queryKey: ["prices"] });
      setForm({ product: "", price: "", location: "" });
      setServerErr(null);
    },
    onError: (e: any) => {
      setServerErr(e.friendly ?? "Could not save price");
      if (e.details) setErrors(Object.fromEntries(Object.entries(e.details).map(([k, v]) => [k, String(v)])));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerErr(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data as { product: string; price: number; location: string });
  };

  const field = (name: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:shadow-glow transition"
      />
      {errors[name] && <div className="text-xs text-destructive mt-1.5">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <header>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">{t("add.tag")}</div>
        <h1 className="font-display text-4xl font-bold">{t("add.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("add.sub")}</p>
      </header>

      {serverErr && <ErrorBanner message={serverErr} />}

      <form onSubmit={submit} className="panel-elevated p-8 space-y-5">
        <div className="flex items-end gap-3">
          <div className="flex-1">{field("product", t("add.product"))}</div>
          <VoiceButton onResult={handleVoice} lang={lang === "am" ? "am-ET" : "en-US"} />
        </div>
        {field("price", t("add.price"), "number")}
        {field("location", t("add.location"))}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary-glow transition-all hover:shadow-glow-strong active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
          {mutation.isPending ? t("add.recording") : t("add.cta")}
        </button>
      </form>

      <div className="text-xs text-muted-foreground text-center font-mono">
        💡 Try voice: <span className="text-primary">"Teff Flour 25kg 4200 Bole"</span>
      </div>
    </div>
  );
}
