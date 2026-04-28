export default function Loader({ label = "Calibrating signals…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground py-12 justify-center">
      <div className="size-2 rounded-full bg-primary animate-pulse-glow" />
      <span className="font-mono uppercase tracking-wider text-xs">{label}</span>
    </div>
  );
}
