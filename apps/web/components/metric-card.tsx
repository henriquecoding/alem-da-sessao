import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "green" | "blue" | "lilac" | "lemon";
}) {
  const tones = {
    neutral: "bg-[var(--pastel-pink)] text-[#7c4550]",
    accent: "bg-[var(--pastel-peach)] text-[var(--accent-foreground)]",
    green: "bg-[var(--pastel-mint)] text-[var(--success)]",
    blue: "bg-[var(--pastel-blue)] text-[var(--info)]",
    lilac: "bg-[var(--pastel-lilac)] text-[#5f4c83]",
    lemon: "bg-[var(--pastel-lemon)] text-[var(--warning)]",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className={cn("grid size-10 place-items-center rounded-2xl", tones[tone])}>
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
          <ArrowUpRight
            className="size-4 text-[var(--muted-foreground)]/45"
            aria-hidden="true"
          />
        </div>
        <p className="mt-6 text-3xl font-bold tracking-[-0.05em]">{value}</p>
        <p className="mt-1 text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{detail}</p>
      </CardContent>
    </Card>
  );
}
