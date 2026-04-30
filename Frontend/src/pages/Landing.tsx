import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BellRing,
  Brain,
  Globe2,
  LineChart,
  MapPin,
  Mic,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import ParticleField from "@/components/ParticleField";
import AnimatedNumber from "@/components/AnimatedNumber";

function LivePulse() {
  const items = [
    { p: "Teff (50kg)", v: 4820, d: -3.2, t: "down" },
    { p: "Sugar (1kg)", v: 95, d: 6.1, t: "up" },
    { p: "Onion (1kg)", v: 62, d: 12.4, t: "up" },
    { p: "Cooking Oil (5L)", v: 1240, d: -1.8, t: "down" },
    { p: "Berbere (1kg)", v: 380, d: 0.4, t: "flat" },
    { p: "Coffee (1kg)", v: 720, d: -4.6, t: "down" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur p-3">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
      <div className="flex gap-3 animate-[ticker_28s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((it, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-border/60">
            <span className="text-[11px] font-mono text-muted-foreground">{it.p}</span>
            <span className="text-xs font-mono tabular text-foreground">ETB {it.v}</span>
            <span
              className={`text-[11px] font-mono tabular ${
                it.t === "up" ? "text-warning" : it.t === "down" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {it.d > 0 ? "+" : ""}
              {it.d}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, hsl(var(--primary) / 0.10), transparent 60%)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[1] transition-[background] duration-150" />;
}

function PredictionOrb() {
  return (
    <div className="relative mx-auto size-[280px] sm:size-[340px]">
      <div className="absolute inset-0 rounded-full border border-primary/30 animate-[float_6s_ease-in-out_infinite]" />
      <div className="absolute inset-4 rounded-full border border-primary/20 animate-[spin_22s_linear_infinite]" />
      <div className="absolute inset-10 rounded-full border border-dashed border-primary/30 animate-[spin_30s_linear_reverse_infinite]" />
      <div
        className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-xl"
        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/80">Confidence</div>
          <div className="font-display text-6xl font-bold glow-text text-primary">
            <AnimatedNumber value={92} />%
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">7-day forecast</div>
          <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
            <TrendingDown className="size-3 text-primary" />
            <span className="text-[10px] font-mono text-primary">BUY NOW</span>
          </div>
        </div>
      </div>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 size-2 rounded-full bg-primary shadow-glow"
          style={{
            transform: `rotate(${deg}deg) translateX(150px)`,
            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Forecasting",
      desc: "Time-series + ensemble models predict the next 7–30 days of price moves.",
    },
    {
      icon: BellRing,
      title: "Real-time Alerts",
      desc: "Instant signals when a product crosses your buy/sell threshold.",
    },
    {
      icon: MapPin,
      title: "Region Compare",
      desc: "Side-by-side prices across Addis, Adama, Bahir Dar, Hawassa & more.",
    },
    {
      icon: Mic,
      title: "Voice Reporting",
      desc: "Add prices in English or Amharic - hands-free, market-floor friendly.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Sources",
      desc: "Crowd + retailer data, deduped & confidence-scored before you see it.",
    },
    {
      icon: Globe2,
      title: "Bilingual UI",
      desc: "Switch English <-> Amharic instantly. Built for the people who buy here.",
    },
  ];

  const steps = [
    { n: "01", t: "Collect", d: "Crowd-sourced & retailer prices flow in continuously." },
    { n: "02", t: "Predict", d: "Our models forecast trend, volatility & best-time-to-buy." },
    { n: "03", t: "Decide", d: "You get a clear BUY NOW or WAIT signal - with reasoning." },
  ];

  return (
    <div className="relative min-h-dvh bg-background text-foreground overflow-x-hidden">
      <Spotlight />

      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all ${
          scrolled > 20 ? "bg-background/70 backdrop-blur-xl border-b border-border" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative size-8 rounded-lg bg-primary/15 border border-primary/40 grid place-items-center">
              <Activity className="size-4 text-primary" />
              <span className="absolute inset-0 rounded-lg" style={{ animation: "pulse-glow 2.5s infinite" }} />
            </div>
            <span className="font-display font-bold tracking-tight">
              PriceGuard <span className="text-primary">AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition">
              Problem
            </a>
            <a href="#solution" className="hover:text-foreground transition">
              Solution
            </a>
            <a href="#how" className="hover:text-foreground transition">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
          </nav>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-mono uppercase tracking-wider shadow-glow hover:shadow-[var(--shadow-glow-strong)] transition"
          >
            Launch app <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </header>

      <main className="relative pt-28 pb-32">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <ParticleField count={70} className="opacity-80" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary">
                Live market intelligence for Ethiopia
              </span>
            </div>
          </div>

          <h1 className="mt-8 text-center font-display font-bold leading-[0.95] text-5xl sm:text-6xl lg:text-7xl">
            Stop guessing prices.
            <br />
            <span className="text-primary glow-text">Start predicting them.</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-center text-base sm:text-lg text-muted-foreground">
            Markets move fast. Buyers overpay, sellers undercharge, and nobody sees the next move coming.
            <span className="text-foreground"> PriceGuard AI</span> turns scattered, noisy market data into crystal-clear
            <span className="text-primary"> buy-now</span> and <span className="text-warning">wait</span> signals - in real time.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-mono uppercase tracking-wider text-sm shadow-glow hover:shadow-[var(--shadow-glow-strong)] hover:-translate-y-0.5 transition"
            >
              <Zap className="size-4" /> Try the live demo
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface/60 backdrop-blur font-mono uppercase tracking-wider text-sm hover:border-primary/50 hover:text-primary transition"
            >
              See the problem
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { v: 12483, l: "Prices tracked", s: "+", icon: LineChart },
              { v: 92, l: "Forecast accuracy", s: "%", icon: Brain },
              { v: 14, l: "Regions live", s: "", icon: MapPin },
              { v: 3, l: "Avg. signal lag (s)", s: "", icon: BellRing },
            ].map((k, i) => (
              <div
                key={i}
                className="panel-elevated p-4 text-center hover:-translate-y-0.5 hover:border-primary/40 transition"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <k.icon className="size-4 text-primary mx-auto mb-1" />
                <div className="font-display text-2xl font-bold tabular">
                  <AnimatedNumber value={k.v} />
                  {k.s}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{k.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="relative">
              <PredictionOrb />
              <div className="absolute -top-4 left-2 px-2 py-1 rounded-md bg-surface/80 border border-border text-[10px] font-mono text-muted-foreground">
                <Sparkles className="inline size-3 text-primary mr-1" /> AI signal
              </div>
              <div className="absolute -bottom-2 right-2 px-2 py-1 rounded-md bg-surface/80 border border-border text-[10px] font-mono text-muted-foreground">
                <TrendingUp className="inline size-3 text-warning mr-1" /> Volatility: low
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
                <span className="size-1.5 rounded-full bg-primary inline-block mr-2 animate-pulse" />
                Streaming now
              </div>
              <h3 className="font-display text-2xl font-bold">A heartbeat for the market.</h3>
              <p className="text-sm text-muted-foreground">
                Every price tick is ingested, deduped, scored, and shown to you with a recommendation - so you never miss a
                window again.
              </p>
              <LivePulse />
              <LivePulse />
            </div>
          </div>

          <div id="problem" className="mt-32 grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-warning">The problem</div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight">
                Market prices are <span className="text-warning">fragmented</span>, <span className="text-warning">volatile</span>, and
                <span className="text-warning"> opaque</span>.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                In Ethiopia and many emerging markets, the same product can swing 30%+ in a week - between cities, between
                vendors, even between hours. Buyers and sellers fly blind.
              </p>
            </div>
            <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
              {[
                { n: "30%+", l: "weekly price swing on staples", icon: TrendingUp },
                { n: "0", l: "centralized, real-time price source", icon: Activity },
                { n: "100%", l: "of decisions made on guesswork", icon: Brain },
              ].map((s, i) => (
                <div key={i} className="panel p-5 hover:border-warning/40 transition group">
                  <s.icon className="size-5 text-warning mb-3 group-hover:scale-110 transition" />
                  <div className="font-display text-3xl font-bold text-warning">{s.n}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="solution" className="mt-24 relative">
            <div className="absolute left-1/2 -top-12 h-12 w-px bg-gradient-to-b from-transparent to-primary/60" />
            <div className="text-center">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary">Our solution</div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight max-w-3xl mx-auto">
                One predictive layer for every price decision - <span className="text-primary glow-text">powered by AI</span>.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
                PriceGuard AI unifies crowd + retailer data, forecasts where prices are heading, and hands you a single,
                confident answer: act now, or wait.
              </p>
            </div>

            <div id="how" className="mt-12 grid md:grid-cols-3 gap-4 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className="relative panel-elevated p-6 hover:-translate-y-1 hover:border-primary/40 transition"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/15 border border-primary/40 grid place-items-center font-mono text-primary text-sm">
                      {s.n}
                    </div>
                    <div className="font-display text-lg font-bold">{s.t}</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="features" className="mt-24">
            <div className="text-center">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary">What's inside</div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">Built to win, designed to delight.</h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="group relative panel p-6 overflow-hidden hover:-translate-y-1 hover:border-primary/40 transition"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
                  <div className="relative">
                    <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center mb-4 group-hover:scale-110 transition">
                      <f.icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-28 relative panel-elevated p-10 sm:p-14 overflow-hidden text-center">
            <ParticleField count={30} />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
                The market won't wait.
                <br />
                <span className="text-primary glow-text">Neither should you.</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Step inside the live dashboard and see what tomorrow's prices look like - today.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-mono uppercase tracking-wider text-sm shadow-glow hover:shadow-[var(--shadow-glow-strong)] hover:-translate-y-0.5 transition"
              >
                Launch PriceGuard AI <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <footer className="mt-20 text-center text-xs font-mono text-muted-foreground">
            {`© ${new Date().getFullYear()} PriceGuard AI · Predictive market intelligence`}
          </footer>
        </div>
      </main>
    </div>
  );
}
