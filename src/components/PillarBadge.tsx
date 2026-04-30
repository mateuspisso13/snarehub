import { cn } from "@/lib/utils";
import { pillarColor } from "@/lib/constants";

export function PillarBadge({ label, kind = "strategic" }: { label?: string | null; kind?: "strategic" | "intention" }) {
  if (!label) return null;
  const color = pillarColor(label);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        "border border-white/5 bg-white/[0.03]",
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `hsl(var(--${color}))` }}
      />
      <span className="text-foreground/80">
        {kind === "intention" ? "Intenção: " : ""}
        {label}
      </span>
    </span>
  );
}
