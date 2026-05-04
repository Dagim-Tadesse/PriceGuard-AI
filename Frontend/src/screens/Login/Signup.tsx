import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { signUpAndCreateProfile } from "@/services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Buyer" | "Seller">("Buyer");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpAndCreateProfile(name || email.split("@")[0], email, password, role.toLowerCase());
      toast.success("Account created — you are signed in");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <LangToggle />
          <ThemeToggle />
        </div>

        <form onSubmit={submit} className="panel-elevated p-8 space-y-4">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3" />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground">Role</label>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setRole("Buyer")} className={`px-4 py-2 rounded-xl border ${role === "Buyer" ? "border-primary bg-primary/10" : "border-border"}`}>Buyer</button>
              <button type="button" onClick={() => setRole("Seller")} className={`px-4 py-2 rounded-xl border ${role === "Seller" ? "border-primary bg-primary/10" : "border-border"}`}>Seller</button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Sellers can submit and edit prices. Buyers can view dashboard and submit price reports.</div>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={loading} type="submit" className="py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold w-full">{loading ? "Creating…" : "Create account"}</button>
          </div>

          <div className="text-xs text-muted-foreground text-center">Already have an account? <a href="/login" className="text-primary">Sign in</a></div>
        </form>
      </div>
    </div>
  );
}
