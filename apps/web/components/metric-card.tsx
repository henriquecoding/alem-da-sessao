import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-[var(--pigment-rose)] text-[var(--accent-foreground)]",
  accent: "bg-[var(--pigment-clay)] text-[var(--accent-foreground)]",
  aqua: "bg-[var(--pigment-sage)] text-[var(--success)]",
  blue: "bg-[var(--pigment-stone)] text-[var(--info)]",
  lilac: "bg-[var(--pigment-sage)] text-[var(--primary)]",
  lemon: "bg-[var(--pigment-ochre)] text-[var(--warning)]",
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
      {/* Compacto por decisão, não por economia de espaço. O Care OS é o modo
          de densidade alta (§6.2); a versão anterior tinha o ícone empilhado
          sobre o número sobre duas linhas de texto e ocupava o dobro da altura
          para dizer o mesmo. Aqui o ícone identifica a linha em vez de a
          encabeçar, e a leitura é uma varredura horizontal. */}
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)]",
              tones[tone],
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
          <p className="truncate text-xs font-medium text-[var(--muted-foreground)]">
            {label}
          </p>
        </div>
        <p className="tabular mt-3 text-[1.75rem] font-semibold leading-none tracking-[-0.04em]">
          {value}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}
