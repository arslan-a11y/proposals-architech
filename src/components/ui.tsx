import { STATUS_META, cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    dot: "#9AA4B2",
    text: "#5B6472",
    bg: "#F0F1F3",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: meta.text, background: meta.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border bg-card shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted">{label}</div>
      <div
        className="mt-2 text-3xl font-semibold tracking-tight"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}
