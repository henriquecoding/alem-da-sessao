import { ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { getProfessionalToday } from "@alem-da-sessao/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { pigmentSurface } from "@/lib/pigment";
import { formatTime } from "@/lib/format";
import { resolveLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const days = [
  { week: "SEG", day: "27", active: true },
  { week: "TER", day: "28", active: false },
  { week: "QUA", day: "29", active: false },
  { week: "QUI", day: "30", active: false },
  { week: "SEX", day: "31", active: false },
];

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, data] = await Promise.all([
    resolveLocale(params),
    getProfessionalToday(),
  ]);

  return (
    <>
      <PageHeading
        eyebrow="27–31 de julho de 2026"
        title="Agenda"
        description="Horários, disponibilidade e conflitos apresentados no fuso Europe/Lisbon."
        action={
          <Button>
            <Plus className="size-4" />
            Nova sessão
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" aria-label="Semana anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Semana seguinte">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Badge tone="success">Sem conflitos</Badge>
      </div>

      <Card className="hidden overflow-hidden md:block">
        <CardContent className="p-0">
          <div className="grid grid-cols-[76px_repeat(5,minmax(150px,1fr))] border-b border-[var(--border)]">
            <div className="p-4" />
            {days.map((day) => (
              <div
                key={day.day}
                className={`border-l border-[var(--border)] p-4 text-center ${
                  day.active
                    ? "surface-pigment-sage border-b-2 border-b-[var(--border-strong)]"
                    : ""
                }`}
              >
                <p className="text-[10px] font-bold tracking-[0.14em] opacity-60">
                  {day.week}
                </p>
                <p className="mt-1 text-lg font-bold">{day.day}</p>
              </div>
            ))}
          </div>
          <div className="relative grid min-h-[570px] grid-cols-[76px_repeat(5,minmax(150px,1fr))]">
            <div className="relative">
              {[
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
              ].map((time, index) => (
                <span
                  key={time}
                  className="absolute right-3 text-[10px] text-[var(--muted-foreground)]"
                  style={{ top: 18 + index * 62 }}
                >
                  {time}
                </span>
              ))}
            </div>
            {days.map((day, dayIndex) => (
              <div
                key={day.day}
                className="relative border-l border-[var(--border)] bg-[linear-gradient(to_bottom,transparent_61px,var(--border)_62px)] bg-[length:100%_62px]"
              >
                {dayIndex === 0 &&
                  data.appointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      // A cor vem do nome, não da posição na lista. O terceiro
                      // da segunda deixa de ser azul só por ser o terceiro: a
                      // Marta é sempre a mesma cor, e é assim que uma semana
                      // cheia se lê num relance. Ver `lib/pigment.ts`.
                      // Sem borda cinzenta à volta: o bloco de cor **é** o
                      // cartão. Uma linha neutra a contornar um pastel apaga-o
                      // — era metade da razão de a agenda parecer morta. Fica
                      // só a aresta esquerda, no tom forte do próprio
                      // pigmento, que é o que se lê como «isto é de alguém».
                      className={cn(
                        "absolute inset-x-2 overflow-hidden rounded-2xl border-l-[5px] border-l-[var(--border-strong)] p-3",
                        "ease-(--ease-out-quint) transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
                        pigmentSurface(appointment.clientName),
                      )}
                      style={{
                        top: 48 + index * 115,
                        minHeight: 92,
                      }}
                    >
                      <p className="truncate text-xs font-bold">
                        {appointment.clientName}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
                        <Clock3 className="size-3" />
                        {formatTime(appointment.startsAt, locale)}
                      </p>
                      {/* O nome e a modalidade continuam escritos: a cor
                          acelera o reconhecimento, nunca o carrega sozinha
                          (WCAG 1.4.1). */}
                      <Badge className="mt-3 border-0 bg-[var(--surface)] text-[var(--foreground)]">
                        {appointment.modality === "online"
                          ? "Online"
                          : "Presencial"}
                      </Badge>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {data.appointments.map((appointment, index) => (
          <Card key={appointment.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`size-13 grid shrink-0 place-items-center rounded-2xl ${
                  index === 0
                    ? "bg-[var(--accent-soft)]"
                    : index === 1
                      ? "bg-[var(--success-soft)]"
                      : "bg-[var(--info-soft)]"
                }`}
              >
                <span className="text-sm font-bold">
                  {formatTime(appointment.startsAt, locale)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {appointment.clientName}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  50 min ·{" "}
                  {appointment.modality === "online" ? "Online" : "Presencial"}
                </p>
              </div>
              <Badge
                tone={appointment.status === "held" ? "warning" : "success"}
              >
                {appointment.status === "held" ? "Reserva" : "Confirmada"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
