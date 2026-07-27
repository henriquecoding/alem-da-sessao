import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * O pigmento tinge o cartão inteiro, não um quadrado de 24 px.
 *
 * Era essa a razão de uma fileira de métricas ler como uma fileira de caixas
 * cinzentas com um pontinho de cor: o tom estava lá, mas em 1% da superfície.
 * Uma linha de métricas é a primeira coisa que se vê num painel e a última que
 * se lê com atenção — precisa de se distinguir por forma e cor antes de
 * alguém chegar aos números.
 *
 * Os nomes são de pigmento e não de significado (`sage`, `clay`) de propósito.
 * Uma métrica não é boa nem má por ser verde; quando um número *tem* estado,
 * quem o diz é o `--state-*` no detalhe, por escrito.
 */
const tones = {
  neutral: "surface-pigment-stone",
  accent: "surface-pigment-clay",
  aqua: "surface-pigment-sage",
  blue: "surface-pigment-sky",
  lilac: "surface-pigment-plum",
  lemon: "surface-pigment-ochre",
  rose: "surface-pigment-rose",
  sand: "surface-pigment-sand",
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
        "group/metric ease-(--ease-out-quint) transition-[box-shadow] duration-300 hover:shadow-[var(--shadow-lg)]",
        tones[tone],
        // **Depois** da superfície, e não antes. A regra de conflito do `cn`
        // manda uma superfície substituir a cor de borda escrita à frente
        // dela — que normalmente é o que se quer, porque a borda vem da
        // superfície. Aqui quer-se o contrário: a aresta é o que carrega o
        // matiz no tema escuro, onde o painel é subtil de propósito. Um traço
        // pequeno e saturado lê-se limpo; um painel grande e saturado lê-se
        // sujo.
        "surface-edge",
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
            // O ícone fica no texto verificado. O matiz do cartão vive na
            // aresta esquerda — uma borda é um gráfico, não texto, e assim a
            // engine não tem de adivinhar variáveis redefinidas dentro do
            // escopo da superfície, que é coisa que ela não sabe fazer.
            className="grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--foreground)]"
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
