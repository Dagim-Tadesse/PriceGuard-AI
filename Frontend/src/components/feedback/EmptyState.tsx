import { LucideIcon } from "lucide-react";

interface Props { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="panel p-12 flex flex-col items-center text-center animate-fade-in">
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 animate-float">
        <Icon className="size-7 text-primary" />
      </div>
      <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
