import type { Locale } from "@alem-da-sessao/i18n";
import { SensitivityTag } from "@/components/sensitivity";
import { cn } from "@/lib/utils";

/**
 * O recibo da travessia — relatório v2 §4.5, quinto momento do gesto.
 *
 * > *"Partilhado a 14 de julho às 21h04. Visto pela Dra. X a 15 de julho às
 * > 09h12."*
 *
 * Um recibo é diferente de uma confirmação: a confirmação diz que o sistema
 * fez o seu trabalho, o recibo diz o que aconteceu com uma coisa da pessoa. É
 * também o que torna o fluxo de dados visível para além do momento do
 * consentimento — a lacuna do consentimento vivido do §3.3.
 */
export function ShareReceipt({
  locale,
  sharedAt,
  seenAt,
  recipientName,
  className,
}: {
  locale: Locale;
  sharedAt: Date;
  seenAt?: Date;
  recipientName: string;
  className?: string;
}) {
  const pt = locale === "pt-PT";

  const stamp = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[var(--shared-border)] bg-[var(--shared-surface)] p-5",
        className,
      )}
    >
      <SensitivityTag level="shared" locale={locale} />

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-[var(--muted-foreground)]">
            {pt ? "Partilhado a" : "Compartilhado em"}
          </dt>
          <dd className="tabular font-semibold text-[var(--shared-foreground)]">
            {stamp(sharedAt)}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-[var(--muted-foreground)]">
            {pt ? "Visto por" : "Visto por"}
          </dt>
          <dd className="font-semibold text-[var(--shared-foreground)]">
            {seenAt ? (
              <>
                {recipientName}{" "}
                <span className="tabular font-normal">
                  {pt ? "a" : "em"} {stamp(seenAt)}
                </span>
              </>
            ) : (
              // "Ainda não" é informação, não uma falha do profissional nem
              // uma pressão sobre ele.
              <span className="font-normal text-[var(--muted-foreground)]">
                {pt ? "ainda não" : "ainda não"}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        {pt
          ? "Pode retirar esta partilha quando quiser. O que já tiver integrado o registo clínico permanece, como foi dito antes de partilhar."
          : "Você pode retirar este compartilhamento quando quiser. O que já tiver integrado o registro clínico permanece, como foi dito antes de compartilhar."}
      </p>
    </div>
  );
}
