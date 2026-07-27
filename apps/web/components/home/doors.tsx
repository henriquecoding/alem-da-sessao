import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LocaleSegment, Messages } from "@alem-da-sessao/i18n";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * Tempo 5 — as duas portas, e a terceira frase.
 *
 * As duas portas não são «para profissionais» e «para clientes» com o mesmo
 * cartão pintado de cores diferentes. Têm pesos tipográficos e ritmos
 * distintos porque os dois modos do produto são distintos (§6.2): a porta
 * profissional é densa e direta, a porta do cliente tem ar à volta. A forma da
 * porta já diz o que está do outro lado.
 *
 * A terceira frase é para quem já tem sessões com alguém. Não é um terceiro
 * cartão — é uma nota no fim, porque essa pessoa não escolhe nada aqui: quem
 * abre o intervalo dela é o profissional. Prometer-lhe um botão de entrada
 * seria vender-lhe uma coisa que não lhe pertence dar.
 */
export function Doors({
  copy,
  segment,
  emphasis = "none",
}: {
  copy: Messages["home"]["doors"];
  segment: LocaleSegment;
  /** Reordena as portas conforme a resposta dada à chegada. */
  emphasis?: "professional" | "client" | "none";
}) {
  const professional = (
    <Door
      key="professional"
      eyebrow={copy.professional.eyebrow}
      body={copy.professional.body}
      cta={copy.professional.cta}
      href={localPath(segment, "/pro/hoje")}
      tone="dense"
      lead={emphasis === "professional"}
    />
  );

  const client = (
    <Door
      key="client"
      eyebrow={copy.client.eyebrow}
      body={copy.client.body}
      cta={copy.client.cta}
      href={localPath(segment, "/cuidado/hoje")}
      tone="open"
      lead={emphasis === "client"}
    />
  );

  return (
    <section
      aria-labelledby="doors-title"
      className="border-t border-[var(--border)] bg-[var(--background-deep)]"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="reveal max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {copy.eyebrow}
          </p>
          <h2
            id="doors-title"
            className="mt-4 text-balance text-[clamp(1.9rem,1.1rem+2.6vw,3rem)] font-bold leading-[1.03] tracking-[-0.05em]"
          >
            {copy.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-pretty leading-8 text-[var(--muted-foreground)]">
            {copy.lede}
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
          {emphasis === "client"
            ? [client, professional]
            : [professional, client]}
        </div>

        <div className="reveal mt-20 max-w-[46ch] border-t-2 border-[var(--shared)] pt-6">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">
            {copy.already.title}
          </h3>
          <p className="mt-3 text-pretty leading-7 text-[var(--muted-foreground)]">
            {copy.already.body}
          </p>
          <Link
            href={localPath(segment, "/seguranca")}
            className="link-underline mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--shared-foreground)]"
          >
            {copy.already.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Door({
  eyebrow,
  body,
  cta,
  href,
  tone,
  lead,
}: {
  eyebrow: string;
  body: string;
  cta: string;
  href: string;
  tone: "dense" | "open";
  lead: boolean;
}) {
  return (
    <div
      className={cn(
        "reveal flex flex-col border-t-2 pt-6",
        lead ? "border-[var(--accent)]" : "border-[var(--foreground)]",
      )}
      style={{ "--d": lead ? 0 : 1 } as CSSProperties}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {eyebrow}
      </p>
      <p
        className={cn(
          "mt-5 max-w-[38ch] text-pretty",
          // A porta densa é compacta e apertada; a porta aberta respira. A
          // diferença de ritmo é o que se vai encontrar do outro lado.
          tone === "dense"
            ? "text-[0.95rem] leading-6"
            : "font-serif text-[1.05rem] leading-8",
        )}
      >
        {body}
      </p>
      <Button
        asChild
        variant={tone === "dense" ? "default" : "secondary"}
        className="mt-7 w-fit"
      >
        <Link href={href}>
          {cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
