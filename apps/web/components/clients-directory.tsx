"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Search, UserPlus, X } from "lucide-react";
import type { ClientSummary } from "@alem-da-sessao/db";
import type { Locale, LocaleSegment } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/page-heading";
import { localPath } from "@/lib/locale";

export function ClientsDirectory({
  initialClients,
  locale,
  segment,
}: {
  initialClients: ClientSummary[];
  locale: Locale;
  segment: LocaleSegment;
}) {
  const pt = locale === "pt-PT";
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    if (!normalized) return initialClients;
    return initialClients.filter((client) =>
      client.displayName.toLocaleLowerCase(locale).includes(normalized),
    );
  }, [initialClients, locale, query]);

  function addClient() {
    const cleanName = name.trim();
    if (cleanName.length < 2 || !email.includes("@")) return;
    setPendingInvites((current) => [
      `${cleanName} · ${email.trim().toLowerCase()}`,
      ...current,
    ]);
    setNotice(
      pt
        ? `Convite local preparado para ${cleanName}; nenhum e-mail foi enviado.`
        : `Convite local preparado para ${cleanName}; nenhum e-mail foi enviado.`,
    );
    setName("");
    setEmail("");
    setFormOpen(false);
  }

  return (
    <>
      <PageHeading
        title="Clientes"
        description={
          pt
            ? "Acesso apenas a pessoas com relação de cuidado ou delegação explícita."
            : "Acesso somente a pessoas com relação de cuidado ou delegação explícita."
        }
        action={
          <Button onClick={() => setFormOpen(true)}>
            <UserPlus className="size-4" aria-hidden="true" />
            {pt ? "Adicionar cliente" : "Adicionar cliente"}
          </Button>
        }
      />

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]"
        >
          <Check className="mr-2 inline size-4" aria-hidden="true" />
          {notice}
        </p>
      )}

      {formOpen && (
        <Card className="border-[var(--primary)]/35 mb-5 bg-[var(--pigment-plum)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  {pt ? "Convidar cliente" : "Convidar cliente"}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {pt
                    ? "No modo local, o convite é apenas acrescentado aos dados fictícios."
                    : "No modo local, o convite é somente adicionado aos dados fictícios."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFormOpen(false)}
                aria-label={pt ? "Fechar convite" : "Fechar convite"}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label>
                <span className="mb-2 block text-xs font-bold">
                  {pt ? "Nome apresentado" : "Nome de exibição"}
                </span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="off"
                />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold">E-mail</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@exemplo.local"
                  autoComplete="off"
                />
              </label>
              <Button
                onClick={addClient}
                disabled={name.trim().length < 2 || !email.includes("@")}
              >
                {pt ? "Preparar convite" : "Preparar convite"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-5 max-w-lg">
        <label htmlFor="client-search" className="sr-only">
          {pt ? "Pesquisar clientes por nome" : "Pesquisar clientes por nome"}
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          aria-hidden="true"
        />
        <Input
          id="client-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-11"
          placeholder={pt ? "Pesquisar por nome…" : "Pesquisar por nome…"}
        />
      </div>

      {pendingInvites.length > 0 && (
        <Card className="mb-5 bg-[var(--pigment-sand)]">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              {pt ? "Convites preparados" : "Convites preparados"}
            </p>
            <ul className="mt-3 space-y-2">
              {pendingInvites.map((invite) => (
                <li
                  key={invite}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 text-sm"
                >
                  <span className="truncate">{invite}</span>
                  <Badge tone="warning">
                    {pt ? "Não enviado" : "Não enviado"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-2 sm:p-3">
          <div className="hidden grid-cols-[1.25fr_.7fr_1fr_auto] gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--muted-foreground)] md:grid">
            <span>Cliente</span>
            <span>{pt ? "Estado" : "Status"}</span>
            <span>{pt ? "Próxima ação" : "Próxima ação"}</span>
            <span className="sr-only">{pt ? "Abrir" : "Abrir"}</span>
          </div>
          <div className="space-y-2">
            {visible.map((client) => (
              <Link
                key={client.id}
                href={localPath(segment, `/pro/clientes/${client.id}`)}
                className="hover:bg-[var(--muted)]/55 grid min-h-20 items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-colors hover:border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:px-4 md:grid-cols-[1.25fr_.7fr_1fr_auto]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--pigment-plum)] text-xs font-bold text-[var(--primary)]">
                    {client.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {client.displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {pt ? "Desde" : "Desde"} {client.relationshipSince}
                    </p>
                  </div>
                </div>
                <Badge
                  tone={client.status === "active" ? "success" : "neutral"}
                  className="w-fit"
                >
                  {client.status === "active"
                    ? pt
                      ? "Ativo"
                      : "Ativo"
                    : pt
                      ? "Pausado"
                      : "Pausado"}
                </Badge>
                <p className="text-xs text-[var(--muted-foreground)] md:text-sm">
                  {client.pendingItem ??
                    (pt ? "Sem pendências" : "Sem pendências")}
                </p>
                <ArrowRight
                  className="hidden size-4 text-[var(--muted-foreground)] md:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
            {visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                <p className="text-sm font-bold">
                  {pt
                    ? "Nenhum cliente corresponde."
                    : "Nenhum cliente corresponde."}
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {pt
                    ? "Altere a pesquisa; a lista original continua intacta."
                    : "Altere a pesquisa; a lista original continua intacta."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
