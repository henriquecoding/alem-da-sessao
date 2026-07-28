import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomeCopy, LocaleSegment } from "@alem-da-sessao/i18n";
import { Button } from "@/components/ui/button";
import { localPath } from "@/lib/locale";

/**
 * O que vem depois do ritual.
 *
 * Duas secções curtas e nada mais. Não é uma grelha de funcionalidades: são as
 * duas pessoas para quem o produto existe, e o fecho. Tudo isto renderiza no
 * servidor — é o texto que o motor de busca lê, e é por isso que a experiência
 * interativa pode ser um único Client Component sem custo de SEO.
 */
export function HomeSections({
  copy,
  segment,
}: {
  copy: HomeCopy;
  segment: LocaleSegment;
}) {
  return (
    <>
      <section
        aria-labelledby="home-about-title"
        className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto w-full max-w-[72rem]">
          <div className="max-w-[46rem]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
              {copy.about.eyebrow}
            </p>
            <h2
              id="home-about-title"
              className="mt-4 text-balance text-[clamp(1.9rem,1.4rem+2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.045em]"
            >
              {copy.about.title}
            </h2>
            <p className="mt-5 max-w-[58ch] text-pretty leading-7 text-[var(--muted-foreground)]">
              {copy.about.lede}
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <AudienceCard
              copy={copy.about.client}
              href={localPath(segment, "/experiencias")}
            />
            <AudienceCard
              copy={copy.about.professional}
              href={localPath(segment, "/demo")}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-close-title"
        className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto w-full max-w-[52rem] text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
            {copy.close.eyebrow}
          </p>
          <h2
            id="home-close-title"
            className="mx-auto mt-4 max-w-[20ch] text-balance text-[clamp(1.9rem,1.4rem+2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            {copy.close.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-pretty leading-7 text-[var(--muted-foreground)]">
            {copy.close.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={localPath(segment, "/demo")}>
                {copy.close.primary}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={localPath(segment, "/seguranca")}>
                {copy.close.secondary}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function AudienceCard({
  copy,
  href,
}: {
  copy: HomeCopy["about"]["client"];
  href: string;
}) {
  return (
    <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {copy.index}
      </p>
      <h3 className="mt-4 max-w-[16ch] text-balance text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
        {copy.title}
      </h3>
      <p className="mt-4 max-w-[46ch] text-pretty leading-7 text-[var(--muted-foreground)]">
        {copy.body}
      </p>
      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {copy.cta}
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
