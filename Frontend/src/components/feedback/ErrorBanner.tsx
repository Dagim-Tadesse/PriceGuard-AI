import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="panel p-4 flex items-center gap-3 border-warning/40 bg-warning/5">
      <AlertTriangle className="size-5 text-warning shrink-0" />
      <div className="text-sm text-foreground/90">{message}</div>
    </div>
  );
}
