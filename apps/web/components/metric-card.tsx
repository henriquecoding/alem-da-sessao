import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-[var(--pastel-pink)] text-[#7c4550]",
  accent: "bg-[var(--pastel-peach)] text-[var(--accent-foreground)]",
  aqua: "bg-[var(--pastel-aqua)] text-[var(--success)]",
  blue: "bg-[var(--pastel-blue)] text-[var(--info)]",
  lilac: "bg-[var(--pastel-lilac)] text-[#5f4c83]",
  lemon: "bg-[var(--pastel-lemon)] text-[var(--warning)]",
} as const;

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
  className,
  style,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Card
      className={cn(
        "group/metric ease-(--ease-out-quint) transition-[border-color,box-shadow] duration-300 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]",
        className,
      )}
      style={style}
    >
      <CardContent className="p-5">
        <span
          className={cn(
            "ease-(--ease-spring) grid size-10 place-items-center rounded-2xl transition-transform duration-500 group-hover/metric:scale-110",
            tones[tone],
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <p className="tabular mt-5 text-[2rem] font-bold leading-none tracking-[-0.05em]">
          {value}
        </p>
        <p className="mt-2.5 text-sm font-semibold leading-5">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}
