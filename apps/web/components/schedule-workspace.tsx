"use client";

import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react";
import type { Appointment, ClientSummary } from "@alem-da-sessao/db";
import type { Locale } from "@alem-da-sessao/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { formatTime } from "@/lib/format";
import { pigmentSurface } from "@/lib/pigment";
import { cn } from "@/lib/utils";

const hourLabels = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

function mondayForOffset(reference: string | undefined, offset: number) {
  const date = reference ? new Date(reference) : new Date();
  const day = date.getUTCDay() || 7;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      (day - 1) * 86_400_000 +
      offset * 7 * 86_400_000,
  );
}

function atDay(monday: Date, index: number) {
  return new Date(monday.getTime() + index * 86_400_000);
}

export function ScheduleWorkspace({
  initialAppointments,
  clients,
  locale,
}: {
  initialAppointments: Appointment[];
  clients: ClientSummary[];
  locale: Locale;
}) {
  const pt = locale === "pt-PT";
  const [appointments, setAppointments] = useState(initialAppointments);
  const [weekOffset, setWeekOffset] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [dayIndex, setDayIndex] = useState("0");
  const [time, setTime] = useState("09:00");
  const [modality, setModality] = useState<Appointment["modality"]>("online");

  const monday = useMemo(
    () => mondayForOffset(initialAppointments[0]?.startsAt, weekOffset),
    [initialAppointments, weekOffset],
  );
  const days = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const date = atDay(monday, index);
        return {
          date,
          iso: date.toISOString().slice(0, 10),
          weekday: new Intl.DateTimeFormat(locale, {
            weekday: "short",
            timeZone: "UTC",
          })
            .format(date)
            .replace(".", "")
            .toUpperCase(),
          day: new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            timeZone: "UTC",
          }).format(date),
        };
      }),
    [locale, monday],
  );

  const weekLabel = `${new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(days[0]!.date)} – ${new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(days[4]!.date)}`;

  const weekAppointments = appointments.filter((appointment) =>
    days.some((day) => appointment.startsAt.slice(0, 10) === day.iso),
  );

  function addAppointment() {
    setError("");
    const client = clients.find((item) => item.id === clientId);
    const day = days[Number(dayIndex)];
    if (!client || !day) return;

    const startsAt = `${day.iso}T${time}:00.000Z`;
    const starts = new Date(startsAt).getTime();
    const ends = starts + 50 * 60_000;
    const conflict = appointments.some((appointment) => {
      const existingStart = new Date(appointment.startsAt).getTime();
      const existingEnd = new Date(appointment.endsAt).getTime();
      return starts < existingEnd && ends > existingStart;
    });

    if (conflict) {
      setError(
        pt
          ? "Este horário colide com uma sessão existente."
          : "Este horário coincide com uma sessão existente.",
      );
      return;
    }

    setAppointments((current) => [
      ...current,
      {
        id: `apt_fixture_${Date.now()}`,
        clientId: client.id,
        clientName: client.displayName,
        startsAt,
        endsAt: new Date(ends).toISOString(),
        status: "confirmed",
        modality,
      },
    ]);
    setFormOpen(false);
    setNotice(
      pt
        ? `Sessão local criada para ${client.displayName}.`
        : `Sessão local criada para ${client.displayName}.`,
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={weekLabel}
        title="Agenda"
        description={
          pt
            ? "Horários, disponibilidade e conflitos no fuso Europe/Lisbon."
            : "Horários, disponibilidade e conflitos no fuso America/Sao_Paulo."
        }
        action={
          <Button onClick={() => setFormOpen(true)}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            {pt ? "Nova sessão" : "Nova sessão"}
          </Button>
        }
      />

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-2xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
        >
          <Check className="mr-2 inline size-4" aria-hidden="true" />
          {notice}
        </p>
      )}

      {formOpen && (
        <Card className="border-[var(--primary)]/35 mb-5 bg-[var(--pigment-plum)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">
                {pt
                  ? "Criar sessão na semana visível"
                  : "Criar sessão na semana visível"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFormOpen(false)}
                aria-label={pt ? "Fechar formulário" : "Fechar formulário"}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
              <label className="xl:col-span-2">
                <span className="mb-2 block text-xs font-bold">Cliente</span>
                <select
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold">
                  {pt ? "Dia" : "Dia"}
                </span>
                <select
                  value={dayIndex}
                  onChange={(event) => setDayIndex(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                >
                  {days.map((day, index) => (
                    <option key={day.iso} value={index}>
                      {day.weekday} · {day.day}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold">
                  {pt ? "Hora" : "Horário"}
                </span>
                <input
                  type="time"
                  value={time}
                  min="08:00"
                  max="17:00"
                  step="1800"
                  onChange={(event) => setTime(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold">Modalidade</span>
                <select
                  value={modality}
                  onChange={(event) =>
                    setModality(event.target.value as Appointment["modality"])
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm"
                >
                  <option value="online">Online</option>
                  <option value="presential">
                    {pt ? "Presencial" : "Presencial"}
                  </option>
                </select>
              </label>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive)]"
              >
                {error}
              </p>
            )}
            <Button className="mt-5" onClick={addAppointment}>
              {pt ? "Criar sessão" : "Criar sessão"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label={pt ? "Semana anterior" : "Semana anterior"}
            onClick={() => {
              setWeekOffset((value) => value - 1);
              setNotice("");
            }}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={pt ? "Semana seguinte" : "Próxima semana"}
            onClick={() => {
              setWeekOffset((value) => value + 1);
              setNotice("");
            }}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <Badge tone="success">
          {pt ? "Conflitos verificados" : "Conflitos verificados"}
        </Badge>
      </div>

      <Card className="hidden overflow-hidden md:block">
        <CardContent className="p-0">
          <div className="grid grid-cols-[76px_repeat(5,minmax(150px,1fr))] border-b border-[var(--border)]">
            <div className="p-4" />
            {days.map((day, index) => (
              <div
                key={day.iso}
                className={cn(
                  "border-l border-[var(--border)] p-4 text-center",
                  index === 0 &&
                    "border-b-2 border-b-[var(--primary)] bg-[var(--pigment-plum)]",
                )}
              >
                <p className="text-[10px] font-bold tracking-[0.14em] opacity-60">
                  {day.weekday}
                </p>
                <p className="mt-1 text-lg font-bold">{day.day}</p>
              </div>
            ))}
          </div>
          <div className="relative grid min-h-[570px] grid-cols-[76px_repeat(5,minmax(150px,1fr))]">
            <div className="relative">
              {hourLabels.map((label, index) => (
                <span
                  key={label}
                  className="absolute right-3 text-[10px] text-[var(--muted-foreground)]"
                  style={{ top: 18 + index * 62 }}
                >
                  {label}
                </span>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.iso}
                className="relative border-l border-[var(--border)] bg-[linear-gradient(to_bottom,transparent_61px,var(--border)_62px)] bg-[length:100%_62px]"
              >
                {weekAppointments
                  .filter(
                    (appointment) =>
                      appointment.startsAt.slice(0, 10) === day.iso,
                  )
                  .map((appointment) => {
                    const appointmentDate = new Date(appointment.startsAt);
                    const hour =
                      appointmentDate.getUTCHours() +
                      appointmentDate.getUTCMinutes() / 60;
                    return (
                      <article
                        key={appointment.id}
                        className={cn(
                          "surface-edge-thick absolute inset-x-2 min-h-[86px] overflow-hidden rounded-2xl p-3 shadow-[var(--shadow-sm)]",
                          pigmentSurface(appointment.clientName),
                        )}
                        style={{ top: 18 + (hour - 8) * 62 }}
                      >
                        <p className="truncate text-xs font-bold">
                          {appointment.clientName}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {formatTime(appointment.startsAt, locale)}
                        </p>
                        <Badge className="mt-2 border-0 bg-[var(--surface)] text-[var(--foreground)]">
                          {appointment.modality === "online"
                            ? "Online"
                            : "Presencial"}
                        </Badge>
                      </article>
                    );
                  })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {weekAppointments.length ? (
          weekAppointments
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
            .map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span
                    className={cn(
                      "size-13 grid shrink-0 place-items-center rounded-2xl text-sm font-bold",
                      pigmentSurface(appointment.clientName),
                    )}
                  >
                    {formatTime(appointment.startsAt, locale)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {appointment.clientName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      50 min ·{" "}
                      {appointment.modality === "online"
                        ? "Online"
                        : "Presencial"}
                    </p>
                  </div>
                  <Badge tone="success">
                    {pt ? "Confirmada" : "Confirmada"}
                  </Badge>
                </CardContent>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-[var(--muted-foreground)]">
              {pt
                ? "Não há sessões nesta semana. Pode criar uma sem perder a posição atual."
                : "Não há sessões nesta semana. Você pode criar uma sem perder a posição atual."}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
