"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Eye,
  Fingerprint,
  HandHeart,
  HeartPulse,
  House,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@alem-da-sessao/i18n";
import { getToolBySlug } from "@alem-da-sessao/tool-registry";
import { renderLoadStructuresPlan } from "@alem-da-sessao/tool-registry/artifact";
import { Arrival } from "@/components/experience-runtime/arrival";
import { ArtifactView } from "@/components/experience-runtime/artifact-view";
import {
  Destination,
  type DestinationChoice,
} from "@/components/experience-runtime/destination";
import {
  loadStructuresSchema,
  type PublicLoadStructureInput,
  type LoadStructuresInput,
} from "@alem-da-sessao/validation";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LoadValue = LoadStructuresInput["loads"][number];
type Ownership = LoadValue["ownership"];
type Movement = LoadValue["movement"];
type HiddenFrom = LoadStructuresInput["hiddenFrom"];

type LoadState = Omit<LoadValue, "ownership" | "movement"> & {
  ownership?: Ownership;
  movement?: Movement;
  custom?: boolean;
};

type LoadOption = {
  id: string;
  icon: LucideIcon;
  labels: Record<Locale, string>;
  descriptors: Record<Locale, string>;
};

const loadOptions: LoadOption[] = [
  {
    id: "work-decisions",
    icon: BriefcaseBusiness,
    labels: {
      "pt-PT": "Decisões que só chegam a mim",
      "pt-BR": "Decisões que só chegam até mim",
    },
    descriptors: {
      "pt-PT": "Trabalho · liderança",
      "pt-BR": "Trabalho · liderança",
    },
  },
  {
    id: "deadlines",
    icon: Layers3,
    labels: {
      "pt-PT": "Manter uma equipa ou projeto de pé",
      "pt-BR": "Manter uma equipe ou projeto de pé",
    },
    descriptors: {
      "pt-PT": "Operação · responsabilidade",
      "pt-BR": "Operação · responsabilidade",
    },
  },
  {
    id: "care-family",
    icon: HandHeart,
    labels: {
      "pt-PT": "Cuidar de alguém que depende de mim",
      "pt-BR": "Cuidar de alguém que depende de mim",
    },
    descriptors: {
      "pt-PT": "Cuidado · família",
      "pt-BR": "Cuidado · família",
    },
  },
  {
    id: "home",
    icon: House,
    labels: {
      "pt-PT": "Manter a casa a funcionar",
      "pt-BR": "Manter a casa funcionando",
    },
    descriptors: {
      "pt-PT": "Casa · logística",
      "pt-BR": "Casa · logística",
    },
  },
  {
    id: "relationship",
    icon: UsersRound,
    labels: {
      "pt-PT": "Sustentar uma relação em desequilíbrio",
      "pt-BR": "Sustentar uma relação em desequilíbrio",
    },
    descriptors: {
      "pt-PT": "Relação · expectativa",
      "pt-BR": "Relação · expectativa",
    },
  },
  {
    id: "money",
    icon: CircleDollarSign,
    labels: {
      "pt-PT": "Garantir a estabilidade financeira",
      "pt-BR": "Garantir a estabilidade financeira",
    },
    descriptors: {
      "pt-PT": "Recursos · segurança",
      "pt-BR": "Recursos · segurança",
    },
  },
  {
    id: "health",
    icon: HeartPulse,
    labels: {
      "pt-PT": "Coordenar saúde, tratamento ou recuperação",
      "pt-BR": "Coordenar saúde, tratamento ou recuperação",
    },
    descriptors: {
      "pt-PT": "Saúde · continuidade",
      "pt-BR": "Saúde · continuidade",
    },
  },
  {
    id: "expectations",
    icon: UserRound,
    labels: {
      "pt-PT": "Corresponder ao que esperam de mim",
      "pt-BR": "Corresponder ao que esperam de mim",
    },
    descriptors: {
      "pt-PT": "Identidade · pertença",
      "pt-BR": "Identidade · pertencimento",
    },
  },
];

const durationOptions = [1, 3, 6, 12, 24, 60] as const;
const ownershipKeys: Ownership[] = ["mine", "shared", "inherited", "unclear"];
const movementKeys: Movement[] = [
  "protect",
  "ask",
  "negotiate",
  "return",
  "observe",
];
const hiddenKeys: HiddenFrom[] = [
  "children",
  "partner",
  "parents",
  "team",
  "public",
  "nobody",
  "unclear",
];

const copy = {
  "pt-PT": {
    stages: ["Assentar", "Medir", "Proveniência", "Ancorar", "Planta"],
    step: "Etapa",
    of: "de",
    continue: "Continuar",
    back: "Voltar",
    clear: "Recomeçar",
    private: "Privado por defeito",
    local: "Nada sai deste navegador",
    collectTitle: "Que estruturas dependem da sua sustentação?",
    collectBody:
      "Escolha até quatro responsabilidades concretas. Não precisa de explicar como se sente para reconhecer o que mantém de pé.",
    chosen: "assentes na fundação",
    customLabel: "Outra responsabilidade concreta",
    customPlaceholder:
      "Ex.: coordenar sozinho os cuidados e as contas da minha mãe",
    customHint:
      "Descreva o facto e a responsabilidade. Evite nomes de pessoas ou empresas.",
    customAction: "Assentar esta carga",
    emotionalHint:
      "Tente trocar o estado emocional pela responsabilidade concreta e pelo que depende dela.",
    customShort: "Escreva pelo menos 12 caracteres para assentar esta carga.",
    maxLoads: "A fundação desta leitura aceita até quatro cargas.",
    measureTitle: "Meça a compressão, não o seu valor.",
    measureBody:
      "A escala descreve alcance e duração. É uma métrica simbólica para organizar a conversa, não uma avaliação clínica.",
    impact: "Se deixar de sustentar isto hoje, até onde chega o impacto?",
    impactLabels: [
      "Só o meu percurso",
      "Outra pessoa",
      "Família ou equipa",
      "Vários dependentes",
      "Colapso estrutural",
    ],
    duration: "Há quanto tempo está nesta posição?",
    durationLabels: [
      "1 mês",
      "3 meses",
      "6 meses",
      "1 ano",
      "2 anos",
      "5+ anos",
    ],
    effectsTitle: "Onde a compressão já deixa marca?",
    effects: ["No tempo", "No sono", "No corpo", "Na atenção", "Nas relações"],
    provenanceTitle: "Como cada carga chegou às suas mãos?",
    provenanceBody:
      "Distinguir escolha, acordo e herança muda a planta. Não decide por si o que deve fazer.",
    ownership: {
      mine: ["Assumida", "Escolhi ou reconheço esta responsabilidade"],
      shared: ["Partilhada", "Existe um acordo com outras pessoas"],
      inherited: ["Herdada", "Fui ocupando o lugar sem uma decisão clara"],
      unclear: ["Por apurar", "Ainda não consigo identificar a origem"],
    },
    anchorTitle: "Onde pode entrar uma nova ancoragem?",
    anchorBody:
      "Escolha um movimento possível. Depois, firme-o num gesto lento; isto não cria uma tarefa nem envia informação.",
    movements: {
      protect: ["Proteger", "Manter a carga com um limite explícito"],
      ask: ["Pedir apoio", "Tornar uma necessidade concreta visível"],
      negotiate: ["Renegociar", "Rever um acordo, prazo ou expectativa"],
      return: ["Devolver", "Questionar se esta carga deve continuar aqui"],
      observe: ["Levar à sessão", "Observar com apoio antes de agir"],
    },
    supportTitle: "Que apoio pode receber peso real?",
    supports: [
      "Uma conversa com pedido concreto",
      "Tempo protegido na agenda",
      "Dividir uma tarefa identificada",
      "Clarificar um limite",
      "Levar esta planta à próxima sessão",
    ],
    hiddenTitle: "De quem tem mantido esta estrutura invisível?",
    hidden: {
      children: "Dos meus filhos",
      partner: "Do meu parceiro ou parceira",
      parents: "Dos meus pais",
      team: "Da minha equipa",
      public: "Do público ou comunidade",
      nobody: "Não a mantenho escondida",
      unclear: "Ainda não sei",
    },
    holdTitle: "Firmar ancoragem",
    holdBody:
      "Mantenha premido durante dois segundos. Com teclado, pressione Enter.",
    holding: "A assentar apoio na fundação…",
    anchored: "Ancoragem firmada",
    mapTitle: "Planta de sustentação",
    mapBody:
      "Um corte técnico do momento: o que está assente, a compressão observada e o movimento que quer levar consigo.",
    symbolicMass: "massa estrutural simbólica",
    metricNote: "A métrica organiza a planta; não interpreta a pessoa.",
    months: "meses de sustentação",
    impactShort: "impacto",
    origin: "proveniência",
    movement: "movimento",
    effectsLabel: "marcas de compressão",
    supportLabel: "ancoragem escolhida",
    hiddenLabel: "limite de visibilidade",
    noteLabel: "Frase para abrir a próxima conversa — opcional",
    notePlaceholder:
      "Ex.: quero perceber como esta responsabilidade ficou apenas comigo.",
    include: "Incluir no snapshot",
    exclude: "Manter só na planta privada",
    save: "Guardar nesta sessão",
    saved: "Planta guardada apenas na memória desta demonstração.",
    preview: "Pré-visualizar partilha",
    previewTitle: "Corte de partilha",
    previewBody:
      "Só os blocos assinalados e esta síntese entrariam no snapshot. Reveja antes de confirmar.",
    publicPreviewBody:
      "A parede recebe apenas estes blocos, medidas simbólicas, proveniência e movimento. Notas, marcas de compressão, apoio escolhido e limite de visibilidade ficam privados.",
    privateFields:
      "Permanece privado: nota da sessão, marcas, apoio escolhido e visibilidade.",
    confirm: "Confirmar snapshot",
    deposit: "Depositar anonimamente",
    depositing: "A assentar na parede…",
    sharedTitle: "Snapshot preparado",
    sharedBody:
      "A demonstração não enviou dados. Numa ligação real, este objeto seria imutável, explícito e revogável.",
    approvedTitle: "A sua estrutura entrou na parede",
    approvedBody:
      "Foi publicada sem nome, conta ou perfil. Outras pessoas podem agora oferecer um gesto de apoio, sem lhe enviar mensagens.",
    pendingTitle: "A estrutura ficou em revisão",
    pendingBody:
      "Como contém escrita livre, será revista antes de aparecer. A sua identidade e as respostas privadas não foram enviadas.",
    rejectedTitle: "Esta versão não pode ser publicada",
    rejectedBody:
      "Detetámos informação que pode identificar alguém ou o limite de depósitos foi atingido. A planta continua privada e pode ser revista.",
    publicationError:
      "Não foi possível chegar à parede agora. A sua planta continua neste navegador.",
    visitWall: "Visitar a parede comunitária",
    restart: "Construir outra planta",
    chooseLoad: "Assente pelo menos uma carga antes de continuar.",
    chooseEffects: "Escolha pelo menos uma marca de compressão.",
    completeProvenance: "Defina a proveniência de cada carga.",
    completeAnchor:
      "Escolha o movimento, o apoio e o limite de visibilidade; depois firme a ancoragem.",
    noShare: "Inclua pelo menos um bloco no snapshot.",
  },
  "pt-BR": {
    stages: ["Assentar", "Medir", "Proveniência", "Ancorar", "Planta"],
    step: "Etapa",
    of: "de",
    continue: "Continuar",
    back: "Voltar",
    clear: "Recomeçar",
    private: "Privado por padrão",
    local: "Nada sai deste navegador",
    collectTitle: "Que estruturas dependem da sua sustentação?",
    collectBody:
      "Escolha até quatro responsabilidades concretas. Você não precisa explicar como se sente para reconhecer o que mantém de pé.",
    chosen: "assentadas na fundação",
    customLabel: "Outra responsabilidade concreta",
    customPlaceholder:
      "Ex.: coordenar sozinho os cuidados e as contas da minha mãe",
    customHint:
      "Descreva o fato e a responsabilidade. Evite nomes de pessoas ou empresas.",
    customAction: "Assentar esta carga",
    emotionalHint:
      "Tente trocar o estado emocional pela responsabilidade concreta e pelo que depende dela.",
    customShort: "Escreva pelo menos 12 caracteres para assentar esta carga.",
    maxLoads: "A fundação desta leitura aceita até quatro cargas.",
    measureTitle: "Meça a compressão, não o seu valor.",
    measureBody:
      "A escala descreve alcance e duração. É uma métrica simbólica para organizar a conversa, não uma avaliação clínica.",
    impact: "Se você deixar de sustentar isto hoje, até onde chega o impacto?",
    impactLabels: [
      "Só o meu percurso",
      "Outra pessoa",
      "Família ou equipe",
      "Vários dependentes",
      "Colapso estrutural",
    ],
    duration: "Há quanto tempo você está nesta posição?",
    durationLabels: [
      "1 mês",
      "3 meses",
      "6 meses",
      "1 ano",
      "2 anos",
      "5+ anos",
    ],
    effectsTitle: "Onde a compressão já deixa marca?",
    effects: ["No tempo", "No sono", "No corpo", "Na atenção", "Nas relações"],
    provenanceTitle: "Como cada carga chegou às suas mãos?",
    provenanceBody:
      "Distinguir escolha, acordo e herança muda a planta. Não decide por você o que fazer.",
    ownership: {
      mine: ["Assumida", "Escolhi ou reconheço esta responsabilidade"],
      shared: ["Compartilhada", "Existe um acordo com outras pessoas"],
      inherited: ["Herdada", "Fui ocupando o lugar sem uma decisão clara"],
      unclear: ["A apurar", "Ainda não consigo identificar a origem"],
    },
    anchorTitle: "Onde pode entrar uma nova ancoragem?",
    anchorBody:
      "Escolha um movimento possível. Depois, firme-o em um gesto lento; isto não cria uma tarefa nem envia informação.",
    movements: {
      protect: ["Proteger", "Manter a carga com um limite explícito"],
      ask: ["Pedir apoio", "Tornar uma necessidade concreta visível"],
      negotiate: ["Renegociar", "Rever um acordo, prazo ou expectativa"],
      return: ["Devolver", "Questionar se esta carga deve continuar aqui"],
      observe: ["Levar à sessão", "Observar com apoio antes de agir"],
    },
    supportTitle: "Que apoio pode receber peso real?",
    supports: [
      "Uma conversa com pedido concreto",
      "Tempo protegido na agenda",
      "Dividir uma tarefa identificada",
      "Esclarecer um limite",
      "Levar esta planta à próxima sessão",
    ],
    hiddenTitle: "De quem você tem mantido esta estrutura invisível?",
    hidden: {
      children: "Dos meus filhos",
      partner: "Do meu parceiro ou parceira",
      parents: "Dos meus pais",
      team: "Da minha equipe",
      public: "Do público ou comunidade",
      nobody: "Não a mantenho escondida",
      unclear: "Ainda não sei",
    },
    holdTitle: "Firmar ancoragem",
    holdBody:
      "Mantenha pressionado durante dois segundos. Com teclado, pressione Enter.",
    holding: "Assentando apoio na fundação…",
    anchored: "Ancoragem firmada",
    mapTitle: "Planta de sustentação",
    mapBody:
      "Um corte técnico do momento: o que está assentado, a compressão observada e o movimento que você quer levar consigo.",
    symbolicMass: "massa estrutural simbólica",
    metricNote: "A métrica organiza a planta; não interpreta a pessoa.",
    months: "meses de sustentação",
    impactShort: "impacto",
    origin: "proveniência",
    movement: "movimento",
    effectsLabel: "marcas de compressão",
    supportLabel: "ancoragem escolhida",
    hiddenLabel: "limite de visibilidade",
    noteLabel: "Frase para abrir a próxima conversa — opcional",
    notePlaceholder:
      "Ex.: quero entender como esta responsabilidade ficou apenas comigo.",
    include: "Incluir no snapshot",
    exclude: "Manter só na planta privada",
    save: "Guardar nesta sessão",
    saved: "Planta guardada apenas na memória desta demonstração.",
    preview: "Pré-visualizar compartilhamento",
    previewTitle: "Corte de compartilhamento",
    previewBody:
      "Só os blocos marcados e esta síntese entrariam no snapshot. Revise antes de confirmar.",
    publicPreviewBody:
      "A parede recebe apenas estes blocos, medidas simbólicas, proveniência e movimento. Notas, marcas de compressão, apoio escolhido e limite de visibilidade ficam privados.",
    privateFields:
      "Permanece privado: nota da sessão, marcas, apoio escolhido e visibilidade.",
    confirm: "Confirmar snapshot",
    deposit: "Depositar anonimamente",
    depositing: "Assentando na parede…",
    sharedTitle: "Snapshot preparado",
    sharedBody:
      "A demonstração não enviou dados. Em uma ligação real, este objeto seria imutável, explícito e revogável.",
    approvedTitle: "Sua estrutura entrou na parede",
    approvedBody:
      "Ela foi publicada sem nome, conta ou perfil. Outras pessoas podem agora oferecer um gesto de apoio, sem enviar mensagens para você.",
    pendingTitle: "A estrutura ficou em revisão",
    pendingBody:
      "Como contém texto livre, ela será revisada antes de aparecer. Sua identidade e as respostas privadas não foram enviadas.",
    rejectedTitle: "Esta versão não pode ser publicada",
    rejectedBody:
      "Detectamos informação que pode identificar alguém ou o limite de depósitos foi atingido. A planta continua privada e pode ser revisada.",
    publicationError:
      "Não foi possível chegar à parede agora. Sua planta continua neste navegador.",
    visitWall: "Visitar a parede comunitária",
    restart: "Construir outra planta",
    chooseLoad: "Assente pelo menos uma carga antes de continuar.",
    chooseEffects: "Escolha pelo menos uma marca de compressão.",
    completeProvenance: "Defina a proveniência de cada carga.",
    completeAnchor:
      "Escolha o movimento, o apoio e o limite de visibilidade; depois firme a ancoragem.",
    noShare: "Inclua pelo menos um bloco no snapshot.",
  },
} as const;

function hashString(value: string) {
  return value.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function formatDuration(months: number, locale: Locale) {
  if (months >= 60) return locale === "pt-PT" ? "5+ anos" : "5+ anos";
  if (months >= 24) return "2 anos";
  if (months >= 12) return "1 ano";
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

function Monolith({
  load,
  compact = false,
}: {
  load: Pick<LoadState, "id" | "impactScale" | "durationMonths">;
  compact?: boolean;
}) {
  const patternId = `strata-${useId().replaceAll(":", "")}`;
  const seed = hashString(load.id);
  const left = 35 + (seed % 16);
  const right = 205 - ((seed >> 3) % 17);
  const shoulder = 54 + ((seed >> 5) % 26);
  const lineCount = load.impactScale * 3;
  const angle = (seed % 31) - 15;
  const opacity = Math.min(
    0.72,
    0.2 + (load.durationMonths * load.impactScale) / 520,
  );

  return (
    <svg
      viewBox="0 0 240 300"
      aria-hidden="true"
      className={cn(
        "drop-shadow-[0_24px_24px_rgba(0,0,0,.28)]",
        compact ? "h-36 w-28" : "h-64 w-48",
      )}
    >
      <defs>
        <pattern
          id={patternId}
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}
        >
          <path
            d="M0 2H18 M0 10H18"
            stroke="#d28751"
            strokeOpacity={opacity}
            strokeWidth={load.impactScale > 3 ? 1.5 : 1}
          />
        </pattern>
        <linearGradient id={`${patternId}-body`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#353943" />
          <stop offset="0.52" stopColor="#202329" />
          <stop offset="1" stopColor="#14161a" />
        </linearGradient>
      </defs>
      <path
        d={`M${left} 270 L${left - 5} ${shoulder + 40} L${
          left + 18
        } ${shoulder} L${right - 25} ${shoulder - 20} L${right + 4} ${
          shoulder + 25
        } L${right} 270 Z`}
        fill={`url(#${patternId}-body)`}
        stroke="#575d69"
        strokeWidth="2"
      />
      <path
        d={`M${left} 270 L${left - 5} ${shoulder + 40} L${
          left + 18
        } ${shoulder} L${right - 25} ${shoulder - 20} L${right + 4} ${
          shoulder + 25
        } L${right} 270 Z`}
        fill={`url(#${patternId})`}
      />
      {Array.from({ length: lineCount }).map((_, index) => {
        const y = 92 + index * (145 / Math.max(lineCount - 1, 1));
        return (
          <path
            key={y}
            d={`M${left + 8} ${y} Q120 ${y + ((seed + index) % 9) - 4} ${
              right - 7
            } ${y - 2}`}
            stroke="#8c939f"
            strokeOpacity={0.13 + index / (lineCount * 12)}
            strokeWidth="1"
            fill="none"
          />
        );
      })}
      <path
        d={`M${left + 16} 265 L${right - 10} 265`}
        stroke="#d28751"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/* The engine renders on its own dark surface, so it cannot use the shared
   Button. These three constants replace what were five hand-rolled copies with
   drifting hover, focus and transition rules. */
const emberButton = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--ember)] px-6 text-sm font-semibold text-[#17181b]",
  "shadow-[var(--shadow-ember)] transition-[background-color,transform,box-shadow] duration-200 ease-(--ease-out-quint)",
  "hover:-translate-y-0.5 hover:bg-[var(--ember-strong)] hover:shadow-[0_2px_4px_rgba(0,0,0,.32),0_10px_26px_rgba(188,101,50,.26)] active:translate-y-px",
  "outline-none focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171b]",
  "disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0",
);

const outlineButton = cn(
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#4a4f59] px-6 text-sm font-semibold text-[#d9dbe0]",
  "transition-[border-color,background-color,color] duration-200 ease-(--ease-out-quint)",
  "hover:border-[#737984] hover:bg-white/5 hover:text-white",
  "outline-none focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171b]",
);

const quietButton = cn(
  "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-semibold text-[#9fa4ae]",
  "transition-colors duration-200 hover:text-white",
  "outline-none focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171b]",
);

function Choice({
  active,
  title,
  description,
  onClick,
  className,
}: {
  active: boolean;
  title: string;
  description?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "group relative min-h-16 rounded-[1.15rem] border px-4 py-3 text-left outline-none transition-[border-color,background-color,transform,box-shadow] focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191d]",
        active
          ? "border-[#d2854f] bg-[#2b231f] shadow-[inset_0_0_0_1px_rgba(210,133,79,.18)]"
          : "border-[#32353d] bg-[#1c1e23] hover:-translate-y-0.5 hover:border-[#5b606b] hover:bg-[#202228]",
        className,
      )}
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
            active
              ? "border-[#d2854f] bg-[#d2854f] text-[#151619]"
              : "border-[#555a65] text-transparent",
          )}
        >
          <Check className="size-3" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#eeeae2]">
            {title}
          </span>
          {description && (
            <span className="mt-1 block text-xs leading-5 text-[#969ba6]">
              {description}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function HoldToAnchor({
  complete,
  onComplete,
  title,
  body,
  holding,
  done,
}: {
  complete: boolean;
  onComplete: () => void;
  title: string;
  body: string;
  holding: string;
  done: string;
}) {
  const [progress, setProgress] = useState(complete ? 1 : 0);
  const frame = useRef<number | null>(null);
  const startedAt = useRef(0);
  const duration = 2000;

  function stop(reset = true) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (reset && !complete) setProgress(0);
  }

  function tick(now: number) {
    const next = Math.min(1, (now - startedAt.current) / duration);
    setProgress(next);
    if (next >= 1) {
      frame.current = null;
      onComplete();
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (complete) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    stop(false);
    startedAt.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setProgress(1);
    onComplete();
  }

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const visibleProgress = complete ? 1 : progress;

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={() => stop()}
      onPointerCancel={() => stop()}
      onKeyDown={keyboard}
      className={cn(
        "relative min-h-28 w-full touch-none overflow-hidden rounded-[1.4rem] border px-5 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191d]",
        complete
          ? "border-[#c98755] bg-[#30251f]"
          : "border-[#3b3f48] bg-[#181a1f] hover:border-[#6d5749]",
      )}
      aria-describedby="anchor-instruction"
    >
      {/* Driven straight from the rAF value, so the fill tracks the finger
          with no transition lag. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-full origin-left bg-[linear-gradient(90deg,rgba(188,101,50,.25),rgba(218,143,88,.38))]"
        style={{ transform: `scaleX(${visibleProgress})` }}
      />
      <span className="relative flex items-center gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full border transition-colors duration-300",
            complete
              ? "border-[#d99560] bg-[#d99560] text-[#17181b]"
              : "border-[#5a5f69] text-[#c0c4cc]",
          )}
          style={
            complete
              ? undefined
              : // A gentle pulse while held, keyed to the same progress value.
                { transform: `scale(${1 + visibleProgress * 0.08})` }
          }
        >
          {complete ? (
            <Check className="size-5" />
          ) : (
            <Fingerprint className="size-5" />
          )}
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#f0ece4]">
            {complete ? done : visibleProgress > 0 ? holding : title}
          </span>
          <span
            id="anchor-instruction"
            className="mt-1 block text-xs leading-5 text-[#999ea9]"
          >
            {body}
          </span>
        </span>
      </span>
    </button>
  );
}

function StageHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d68a54]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-serif text-3xl font-medium leading-[1.05] tracking-[-0.035em] text-[#f1ede5] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9da2ad]">{body}</p>
    </div>
  );
}

export function LoadStructuresExperience({
  locale,
  community = false,
}: {
  locale: Locale;
  community?: boolean;
}) {
  const t = copy[locale];
  const [stage, setStage] = useState(0);
  const [loads, setLoads] = useState<LoadState[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [effects, setEffects] = useState<string[]>([]);
  const [support, setSupport] = useState("");
  const [hiddenFrom, setHiddenFrom] = useState<HiddenFrom | "">("");
  const [nextSessionNote, setNextSessionNote] = useState("");
  const [anchored, setAnchored] = useState(false);
  const [saved, setSaved] = useState(false);
  // O ritual de cinco tempos (§7.2). "arrival" e "forming" são os dois tempos
  // que o mercado inteiro salta.
  const [mode, setMode] = useState<
    "arrival" | "editing" | "forming" | "preview" | "shared" | "discarded"
  >("arrival");
  const [publishing, setPublishing] = useState(false);
  const [publication, setPublication] = useState<{
    status: "approved" | "pending" | "rejected";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const manifest = getToolBySlug("estruturas-de-carga")!;

  /**
   * O artefacto — a planta de cargas (§4.1). Determinística: a mesma
   * configuração produz sempre a mesma planta, o que permite à pessoa
   * reconhecer a sua estrutura entre sessões sem que nada a pontue.
   *
   * `formedAt` é congelado no primeiro render: se viesse do relógio a cada
   * passagem, o artefacto deixaria de ser reproduzível.
   */
  const [formedAt] = useState(() => new Date().toISOString());

  const artifactSvg = useMemo(
    () =>
      loads.length
        ? renderLoadStructuresPlan(
            {
              loads: loads.map((load) => ({
                id: load.id,
                label: load.label,
                impactScale: load.impactScale,
                durationMonths: load.durationMonths,
                ownership: load.ownership ?? "unclear",
                movement: load.movement ?? "observe",
              })),
              support,
              anchored,
            },
            {
              toolId: manifest.id,
              toolVersion: manifest.version,
              locale,
              createdAt: formedAt,
            },
          )
        : null,
    [loads, support, anchored, formedAt, locale, manifest.id, manifest.version],
  );

  const totalMass = loads.reduce(
    (sum, load) => sum + load.durationMonths * load.impactScale,
    0,
  );
  const emotionalCue =
    /\b(sinto|sinto-me|odeio|chorar|triste|ansioso|ansiosa|sofrimento|dor)\b/i.test(
      customLabel,
    );

  function toggleLoad(option: LoadOption) {
    setLoads((current) => {
      if (current.some((item) => item.id === option.id)) {
        return current.filter((item) => item.id !== option.id);
      }
      if (current.length >= 4) {
        setError(t.maxLoads);
        return current;
      }
      return [
        ...current,
        {
          id: option.id,
          label: option.labels[locale],
          impactScale: 3,
          durationMonths: 6,
          includeInShare: true,
        },
      ];
    });
    setSaved(false);
    setError(null);
  }

  function addCustomLoad() {
    const label = customLabel.trim();
    if (label.length < 12) {
      setError(t.customShort);
      return;
    }
    if (loads.length >= 4) {
      setError(t.maxLoads);
      return;
    }
    setLoads((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        label,
        impactScale: 3,
        durationMonths: 6,
        includeInShare: true,
        custom: true,
      },
    ]);
    setCustomLabel("");
    setError(null);
  }

  function updateLoad(id: string, patch: Partial<LoadState>) {
    setLoads((current) =>
      current.map((load) => (load.id === id ? { ...load, ...patch } : load)),
    );
    if ("movement" in patch) setAnchored(false);
    setSaved(false);
    setError(null);
  }

  function toggleEffect(effect: string) {
    setEffects((current) =>
      current.includes(effect)
        ? current.filter((item) => item !== effect)
        : [...current, effect],
    );
    setSaved(false);
    setError(null);
  }

  function canAdvance() {
    if (stage === 0) return loads.length > 0;
    if (stage === 1) return effects.length > 0;
    if (stage === 2) return loads.every((load) => load.ownership);
    if (stage === 3) {
      return (
        loads.every((load) => load.movement) &&
        Boolean(support) &&
        Boolean(hiddenFrom) &&
        anchored
      );
    }
    return true;
  }

  function advance() {
    if (!canAdvance()) {
      const messages = [
        t.chooseLoad,
        t.chooseEffects,
        t.completeProvenance,
        t.completeAnchor,
      ];
      setError(messages[stage] ?? t.completeAnchor);
      return;
    }
    setStage((current) => Math.min(4, current + 1));
    setError(null);
  }

  function reset() {
    setStage(0);
    setLoads([]);
    setCustomLabel("");
    setEffects([]);
    setSupport("");
    setHiddenFrom("");
    setNextSessionNote("");
    setAnchored(false);
    setSaved(false);
    setMode("editing");
    setPublication(null);
    setPublishing(false);
    setError(null);
  }

  const finalValue: LoadStructuresInput = {
    loads: loads
      .filter(
        (
          load,
        ): load is LoadState & {
          ownership: Ownership;
          movement: Movement;
        } => Boolean(load.ownership && load.movement),
      )
      .map((load) => ({
        id: load.id,
        label: load.label,
        impactScale: load.impactScale,
        durationMonths: load.durationMonths,
        ownership: load.ownership,
        movement: load.movement,
        includeInShare: load.includeInShare,
      })),
    effects,
    support,
    hiddenFrom: hiddenFrom || "unclear",
    nextSessionNote,
  };

  function prepareShare() {
    if (!loads.some((load) => load.includeInShare)) {
      setError(t.noShare);
      return;
    }
    if (!loadStructuresSchema.safeParse(finalValue).success) {
      setError(t.completeAnchor);
      return;
    }
    setMode("preview");
    setError(null);
  }

  async function confirmShare() {
    if (!community) {
      setMode("shared");
      return;
    }

    const publicValue: PublicLoadStructureInput = {
      locale,
      consent: true,
      loads: loads
        .filter(
          (
            load,
          ): load is LoadState & {
            ownership: Ownership;
            movement: Movement;
          } => Boolean(load.includeInShare && load.ownership && load.movement),
        )
        .map((load) => ({
          id: load.id,
          label: load.label,
          impactScale: load.impactScale,
          durationMonths: load.durationMonths,
          ownership: load.ownership,
          movement: load.movement,
          custom: Boolean(load.custom),
        })),
    };

    setPublishing(true);
    setError(null);
    try {
      const response = await fetch("/api/public/load-structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicValue),
      });
      const result = (await response.json()) as {
        status?: "approved" | "pending" | "rejected";
      };
      if (!result.status) throw new Error("publication-failed");
      setPublication({ status: result.status });
      setMode("shared");
      if (result.status === "approved") {
        window.dispatchEvent(new Event("load-structure-published"));
      }
    } catch {
      setError(t.publicationError);
    } finally {
      setPublishing(false);
    }
  }

  function chooseDestination(choice: DestinationChoice) {
    if (choice === "discard") {
      // "Sem rasto" tem de ser literal: o estado sai da memória no mesmo
      // gesto, sem viagem ao servidor e sem nada para reverter.
      setLoads([]);
      setEffects([]);
      setSupport("");
      setHiddenFrom("");
      setNextSessionNote("");
      setAnchored(false);
      setStage(0);
      setMode("discarded");
      return;
    }
    if (choice === "share") {
      // Continua a passar pela validação: a pré-visualização só faz sentido
      // se houver de facto algo selecionado para atravessar.
      prepareShare();
      return;
    }
    setSaved(true);
  }

  // -----------------------------------------------------------------------
  // Tempo 1 — Chegada (§7.2). Antes de qualquer campo.
  // -----------------------------------------------------------------------
  if (mode === "arrival") {
    return (
      <Arrival
        manifest={manifest}
        locale={locale}
        tone="ink"
        onBegin={
          <button
            type="button"
            onClick={() => setMode("editing")}
            className={emberButton}
          >
            {t.continue}
            <ArrowRight className="size-4" />
          </button>
        }
      />
    );
  }

  // -----------------------------------------------------------------------
  // Tempo 3 — Formação, e tempo 5 — Destino (§7.2).
  // -----------------------------------------------------------------------
  if (mode === "forming" && artifactSvg) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="enter font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ember)]">
          {locale === "pt-PT" ? "A planta" : "A planta"}
        </p>
        <h2 className="enter mt-3 text-balance font-serif text-4xl font-medium leading-[1.02] tracking-[-0.04em] text-[var(--ink-foreground)]">
          {locale === "pt-PT"
            ? "Esta é a estrutura que sustenta."
            : "Esta é a estrutura que você sustenta."}
        </h2>
        <p className="enter mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-muted)]">
          {locale === "pt-PT"
            ? "A largura vem do impacto que indicou, a altura da duração, a textura da proveniência. Nenhuma delas é uma nota: a planta regista forma, não valor."
            : "A largura vem do impacto que você indicou, a altura da duração, a textura da proveniência. Nenhuma delas é uma nota: a planta registra forma, não valor."}
        </p>

        <ArtifactView
          className="mt-9"
          svg={artifactSvg}
          locale={locale}
          fileName={`estruturas-de-carga-${formedAt.slice(0, 10)}`}
        />

        <Destination
          className="mt-12"
          locale={locale}
          mode={community ? "guest" : "account"}
          onChoose={chooseDestination}
        />
      </section>
    );
  }

  if (mode === "discarded") {
    return (
      <section className="mx-auto max-w-2xl rounded-[1.8rem] border border-[#373a42] bg-[#17191d] p-10 text-center">
        <h2 className="font-serif text-3xl font-medium text-[var(--ink-foreground)]">
          {locale === "pt-PT" ? "Não ficou nada." : "Não ficou nada."}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--ink-muted)]">
          {locale === "pt-PT"
            ? "A planta desapareceu deste navegador e nunca chegou a sair dele."
            : "A planta desapareceu deste navegador e nunca chegou a sair dele."}
        </p>
        <button
          type="button"
          onClick={() => setMode("arrival")}
          className={cn(outlineButton, "mt-8")}
        >
          {t.restart}
        </button>
      </section>
    );
  }

  if (mode === "shared") {
    const publicationCopy =
      publication?.status === "approved"
        ? [t.approvedTitle, t.approvedBody]
        : publication?.status === "pending"
          ? [t.pendingTitle, t.pendingBody]
          : publication?.status === "rejected"
            ? [t.rejectedTitle, t.rejectedBody]
            : [t.sharedTitle, t.sharedBody];

    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-[#393d45] bg-[#181a1f] shadow-[0_40px_100px_rgba(0,0,0,.32)]">
        <div className="relative flex min-h-[570px] flex-col items-center justify-center overflow-hidden px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative">
            <span className="mx-auto grid size-20 place-items-center rounded-full border border-[#d58b57]/50 bg-[#2d241f] text-[#dfa06f]">
              <Check className="size-8" />
            </span>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[#d58b57]">
              Registo concluído
            </p>
            <h2 className="mt-3 font-serif text-4xl font-medium text-[#f2eee6] sm:text-5xl">
              {publicationCopy[0]}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#9fa4ae]">
              {publicationCopy[1]}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {community && publication?.status === "approved" && (
                <a href="#parede-comunitaria" className={emberButton}>
                  {t.visitWall}
                </a>
              )}
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#4a4f59] px-6 text-sm font-semibold text-[#d9dbe0] hover:border-[#737984]"
              >
                <RotateCcw className="size-4" />
                {t.restart}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (mode === "preview") {
    const sharedLoads = loads.filter((load) => load.includeInShare);
    return (
      <section className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => setMode("editing")}
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#a8adb7] hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t.back}
        </button>
        <div className="overflow-hidden rounded-[2rem] border border-[#3b3e47] bg-[#17191d] shadow-[0_36px_90px_rgba(0,0,0,.3)]">
          <div className="border-b border-[#31343b] px-6 py-7 sm:px-9">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#d68b55]/40 bg-[#2d241f] text-[#dda06f]">
                <Eye className="size-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#d58b57]">
                  Snapshot explícito
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#f1ede5] sm:text-4xl">
                  {t.previewTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9da2ad]">
                  {community ? t.publicPreviewBody : t.previewBody}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-[#30333a] lg:grid-cols-2">
            {sharedLoads.map((load) => (
              <article
                key={load.id}
                className="group grid min-h-64 grid-cols-[1fr_auto] gap-4 bg-[#1b1d22] p-6 sm:p-8"
              >
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#858b96]">
                    BL-{load.id.slice(-4).toUpperCase()}
                  </p>
                  <h3 className="mt-4 max-w-sm font-serif text-2xl leading-tight text-[#eeeae2]">
                    {load.label}
                  </h3>
                  <dl className="mt-6 space-y-2 text-xs">
                    <div className="flex gap-2">
                      <dt className="text-[#777d88]">{t.origin}:</dt>
                      <dd className="text-[#c8cbd1]">
                        {t.ownership[load.ownership!][0]}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-[#777d88]">{t.movement}:</dt>
                      <dd className="text-[#c8cbd1]">
                        {t.movements[load.movement!][0]}
                      </dd>
                    </div>
                  </dl>
                </div>
                <Monolith load={load} compact />
              </article>
            ))}
          </div>

          {community ? (
            <div className="border-t border-[#31343b] bg-[#14161a] p-6 sm:p-9">
              <p className="flex items-start gap-3 text-sm leading-6 text-[#b8bcc5]">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#d58b57]" />
                {t.privateFields}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 border-t border-[#31343b] p-6 sm:p-9 lg:grid-cols-3">
              {[
                [t.effectsLabel, effects.join(" · ")],
                [t.supportLabel, support],
                [t.hiddenLabel, t.hidden[hiddenFrom || "unclear"]],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858b96]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#d3d5da]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
          {!community && nextSessionNote && (
            <blockquote className="mx-6 mb-6 border-l-2 border-[#d58b57] pl-5 font-serif text-lg leading-7 text-[#ddd9d1] sm:mx-9 sm:mb-9">
              {nextSessionNote}
            </blockquote>
          )}
          <div className="flex flex-col gap-3 border-t border-[#31343b] p-6 sm:flex-row sm:justify-end sm:p-9">
            <button
              type="button"
              onClick={() => setMode("editing")}
              className={outlineButton}
            >
              {t.back}
            </button>
            <button
              type="button"
              disabled={publishing}
              onClick={confirmShare}
              className={emberButton}
            >
              {publishing && <LoaderCircle className="size-4 animate-spin" />}
              {publishing ? t.depositing : community ? t.deposit : t.confirm}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[1.8rem] border border-[#373a42] bg-[#17191d] shadow-[0_42px_120px_rgba(0,0,0,.34)]">
        <div className="grid border-b border-[#30333a] lg:grid-cols-[1fr_280px]">
          <div className="px-5 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9ba0aa]">
                {t.step} {stage + 1} {t.of} 5 · {t.stages[stage]}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-[#858b96]">
                <LockKeyhole className="size-3.5 text-[#d58b57]" />
                <span className="hidden sm:inline">{t.private}</span>
              </div>
            </div>
            <div
              className="mt-4 h-1 overflow-hidden rounded-full bg-[#2a2d33]"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={stage + 1}
              aria-label={`${t.step} ${stage + 1} ${t.of} 5`}
            >
              {/* Scaled rather than resized: width animation reflows on every
                  frame, transform does not. */}
              <div
                className="ease-(--ease-out-quint) h-full origin-left rounded-full bg-[linear-gradient(90deg,#a6572f,#dd955f)] transition-transform duration-700"
                style={{ transform: `scaleX(${(stage + 1) / 5})` }}
              />
            </div>
          </div>
          <div className="hidden items-center justify-between border-l border-[#30333a] px-6 lg:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#747a85]">
              Registo local
            </span>
            <ShieldCheck className="size-4 text-[#b7784e]" />
          </div>
        </div>

        {/* Keyed on the stage so advancing reads as a new panel arriving. */}
        <div
          key={stage}
          className="animate-sheet-in min-h-[650px] p-5 sm:p-8 lg:p-10"
        >
          {stage === 0 && (
            <fieldset>
              <legend className="sr-only">{t.collectTitle}</legend>
              <StageHeading
                eyebrow="Levantamento da fundação"
                title={t.collectTitle}
                body={t.collectBody}
              />

              <div className="mb-5 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#858b96]">
                  {loads.length}/4 {t.chosen}
                </p>
                {loads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLoads([])}
                    className="inline-flex items-center gap-2 text-xs text-[#969ba6] hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                    {t.clear}
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {loadOptions.map((option) => {
                  const active = loads.some((load) => load.id === option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleLoad(option)}
                      className={cn(
                        "group relative min-h-44 overflow-hidden rounded-[1.25rem] border p-4 text-left outline-none",
                        "ease-(--ease-out-quint) transition-[border-color,background-color,transform,box-shadow] duration-300",
                        "focus-visible:ring-2 focus-visible:ring-[#dc8a52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17191d]",
                        active
                          ? "-translate-y-0.5 border-[#d28751] bg-[#2a231f] shadow-[0_10px_30px_rgba(0,0,0,.35)]"
                          : "border-[#34373f] bg-[#1d1f24] hover:-translate-y-1 hover:border-[#5b606a] hover:shadow-[0_14px_34px_rgba(0,0,0,.4)]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-full border transition-colors duration-300",
                          active
                            ? "border-[#d28751]/50 bg-[#d28751] text-[#17181b]"
                            : "border-[#41454f] bg-[#24272d] text-[#aeb2ba]",
                        )}
                      >
                        {active ? (
                          <Check className="size-4" />
                        ) : (
                          <option.icon className="size-4" />
                        )}
                      </span>
                      <span className="mt-7 block font-serif text-lg leading-6 text-[#eeeae2]">
                        {option.labels[locale]}
                      </span>
                      <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#777d88]">
                        {option.descriptors[locale]}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d28751]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-[#34373f] bg-[#1b1d22] p-4 sm:p-5">
                <label
                  htmlFor="custom-load"
                  className="text-sm font-semibold text-[#ece8e0]"
                >
                  {t.customLabel}
                </label>
                <p className="mt-1 text-xs leading-5 text-[#898f9a]">
                  {t.customHint}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <Textarea
                      id="custom-load"
                      value={customLabel}
                      maxLength={220}
                      onChange={(event) => {
                        setCustomLabel(event.target.value);
                        setError(null);
                      }}
                      placeholder={t.customPlaceholder}
                      className="min-h-24 border-[#3a3e47] bg-[#14161a] text-[#eeeae2] placeholder:text-[#676d78] focus:border-[#d28751] focus:ring-[#d28751]/15"
                    />
                    <div className="mt-2 flex justify-between gap-4">
                      <p
                        className={cn(
                          "text-xs",
                          emotionalCue ? "text-[#e5a06f]" : "text-[#747a85]",
                        )}
                      >
                        {emotionalCue ? t.emotionalHint : t.local}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-[#747a85]">
                        {customLabel.length}/220
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomLoad}
                    disabled={!customLabel.trim()}
                    className="min-h-12 rounded-full border border-[#5b606b] px-5 text-sm font-semibold text-[#e1e2e5] hover:border-[#d28751] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.customAction}
                  </button>
                </div>
              </div>
            </fieldset>
          )}

          {stage === 1 && (
            <fieldset>
              <legend className="sr-only">{t.measureTitle}</legend>
              <StageHeading
                eyebrow="Cálculo de compressão"
                title={t.measureTitle}
                body={t.measureBody}
              />

              <div className="space-y-4">
                {loads.map((load, loadIndex) => (
                  <article
                    key={load.id}
                    className="grid overflow-hidden rounded-[1.35rem] border border-[#34373f] bg-[#1b1d22] lg:grid-cols-[170px_1fr]"
                  >
                    <div className="flex items-center justify-center border-b border-[#30333a] bg-[#15171b] p-4 lg:border-b-0 lg:border-r">
                      <div className="text-center">
                        <Monolith load={load} compact />
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#727883]">
                          BL-{String(loadIndex + 1).padStart(2, "0")} ·{" "}
                          {load.durationMonths * load.impactScale} u
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="font-serif text-xl text-[#eeeae2]">
                        {load.label}
                      </h3>
                      <div className="mt-5">
                        <p className="text-xs font-semibold leading-5 text-[#bfc2c9]">
                          {t.impact}
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-5">
                          {t.impactLabels.map((label, index) => (
                            <button
                              key={label}
                              type="button"
                              aria-pressed={load.impactScale === index + 1}
                              onClick={() =>
                                updateLoad(load.id, {
                                  impactScale: (index + 1) as 1 | 2 | 3 | 4 | 5,
                                })
                              }
                              className={cn(
                                "min-h-14 rounded-xl border px-2 py-2 text-[11px] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-[#d28751]",
                                load.impactScale === index + 1
                                  ? "border-[#d28751] bg-[#30251f] text-[#f0e5dc]"
                                  : "border-[#353941] bg-[#202228] text-[#9da2ad] hover:border-[#5b606b]",
                              )}
                            >
                              <span className="mb-1 block font-mono text-[9px] text-[#d28751]">
                                0{index + 1}
                              </span>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-semibold text-[#bfc2c9]">
                          {t.duration}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {durationOptions.map((months, index) => (
                            <button
                              key={months}
                              type="button"
                              aria-pressed={load.durationMonths === months}
                              onClick={() =>
                                updateLoad(load.id, { durationMonths: months })
                              }
                              className={cn(
                                "min-h-10 rounded-full border px-4 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#d28751]",
                                load.durationMonths === months
                                  ? "border-[#d28751] bg-[#d28751] font-semibold text-[#17181b]"
                                  : "border-[#3c4049] text-[#a9adb6] hover:border-[#696f79]",
                              )}
                            >
                              {t.durationLabels[index]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-7">
                <p className="text-sm font-semibold text-[#e8e4dc]">
                  {t.effectsTitle}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.effects.map((effect) => (
                    <button
                      key={effect}
                      type="button"
                      aria-pressed={effects.includes(effect)}
                      onClick={() => toggleEffect(effect)}
                      className={cn(
                        "min-h-11 rounded-full border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#d28751]",
                        effects.includes(effect)
                          ? "border-[#d28751] bg-[#2d241f] text-[#f0e8e0]"
                          : "border-[#3c4048] text-[#a4a9b2] hover:border-[#676d77]",
                      )}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>
          )}

          {stage === 2 && (
            <fieldset>
              <legend className="sr-only">{t.provenanceTitle}</legend>
              <StageHeading
                eyebrow="Leitura de proveniência"
                title={t.provenanceTitle}
                body={t.provenanceBody}
              />
              <div className="space-y-4">
                {loads.map((load, index) => (
                  <article
                    key={load.id}
                    className="rounded-[1.35rem] border border-[#34373f] bg-[#1b1d22] p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#4a4f59] font-mono text-[10px] text-[#d58b57]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-serif text-xl text-[#eeeae2]">
                          {load.label}
                        </h3>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#777d88]">
                          {formatDuration(load.durationMonths, locale)} ·
                          impacto {load.impactScale}/5
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {ownershipKeys.map((key) => (
                        <Choice
                          key={key}
                          active={load.ownership === key}
                          title={t.ownership[key][0]}
                          description={t.ownership[key][1]}
                          onClick={() =>
                            updateLoad(load.id, { ownership: key })
                          }
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </fieldset>
          )}

          {stage === 3 && (
            <fieldset>
              <legend className="sr-only">{t.anchorTitle}</legend>
              <StageHeading
                eyebrow="Ensaio de redistribuição"
                title={t.anchorTitle}
                body={t.anchorBody}
              />
              <div className="space-y-4">
                {loads.map((load, index) => (
                  <article
                    key={load.id}
                    className="rounded-[1.35rem] border border-[#34373f] bg-[#1b1d22] p-5 sm:p-6"
                  >
                    <h3 className="font-serif text-xl text-[#eeeae2]">
                      <span className="mr-3 font-mono text-[10px] text-[#d58b57]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {load.label}
                    </h3>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {movementKeys.map((key) => (
                        <Choice
                          key={key}
                          active={load.movement === key}
                          title={t.movements[key][0]}
                          description={t.movements[key][1]}
                          onClick={() => updateLoad(load.id, { movement: key })}
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[1.35rem] border border-[#34373f] bg-[#1b1d22] p-5 sm:p-6">
                  <p className="text-sm font-semibold text-[#e8e4dc]">
                    {t.supportTitle}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {t.supports.map((item) => (
                      <Choice
                        key={item}
                        active={support === item}
                        title={item}
                        onClick={() => {
                          setSupport(item);
                          setAnchored(false);
                          setError(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-[#34373f] bg-[#1b1d22] p-5 sm:p-6">
                  <p className="text-sm font-semibold text-[#e8e4dc]">
                    {t.hiddenTitle}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {hiddenKeys.map((key) => (
                      <Choice
                        key={key}
                        active={hiddenFrom === key}
                        title={t.hidden[key]}
                        onClick={() => {
                          setHiddenFrom(key);
                          setAnchored(false);
                          setError(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <HoldToAnchor
                  complete={anchored}
                  onComplete={() => {
                    setAnchored(true);
                    setError(null);
                  }}
                  title={t.holdTitle}
                  body={t.holdBody}
                  holding={t.holding}
                  done={t.anchored}
                />
              </div>
            </fieldset>
          )}

          {stage === 4 && (
            <div>
              <StageHeading
                eyebrow="Artefacto de continuidade"
                title={t.mapTitle}
                body={t.mapBody}
              />

              <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  {loads.map((load, index) => (
                    <article
                      key={load.id}
                      className="group relative overflow-hidden rounded-[1.35rem] border border-[#373b43] bg-[#1b1d22] p-5"
                    >
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#777d88]">
                            BL-{String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-3 font-serif text-xl leading-6 text-[#eeeae2]">
                            {load.label}
                          </h3>
                          <dl className="mt-5 space-y-2 text-xs">
                            <div>
                              <dt className="inline text-[#777d88]">
                                {t.origin}:{" "}
                              </dt>
                              <dd className="inline text-[#c9ccd2]">
                                {t.ownership[load.ownership!][0]}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline text-[#777d88]">
                                {t.movement}:{" "}
                              </dt>
                              <dd className="inline text-[#c9ccd2]">
                                {t.movements[load.movement!][0]}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <Monolith load={load} compact />
                      </div>
                      <button
                        type="button"
                        aria-pressed={load.includeInShare}
                        onClick={() =>
                          updateLoad(load.id, {
                            includeInShare: !load.includeInShare,
                          })
                        }
                        className={cn(
                          "mt-4 flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#d28751]",
                          load.includeInShare
                            ? "border-[#8b5f43] bg-[#2b231f] text-[#eadfd6]"
                            : "border-[#383c44] text-[#8f949f]",
                        )}
                      >
                        <span>
                          {load.includeInShare ? t.include : t.exclude}
                        </span>
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full border",
                            load.includeInShare
                              ? "border-[#d28751] bg-[#d28751] text-[#17181b]"
                              : "border-[#555a64]",
                          )}
                        >
                          <Check className="size-3" />
                        </span>
                      </button>
                    </article>
                  ))}
                </div>

                <aside className="rounded-[1.35rem] border border-[#3a3e46] bg-[#14161a] p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#d28751]">
                    Leitura consolidada
                  </p>
                  <p className="mt-5 font-serif text-5xl text-[#eeeae2]">
                    {totalMass}
                    <span className="ml-2 font-mono text-xs text-[#777d88]">
                      u
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#858b96]">
                    {t.symbolicMass}
                  </p>
                  <div className="my-6 h-px bg-[#30333a]" />
                  <dl className="space-y-5 text-xs">
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#777d88]">
                        {t.effectsLabel}
                      </dt>
                      <dd className="mt-2 leading-5 text-[#c8cbd1]">
                        {effects.join(" · ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#777d88]">
                        {t.supportLabel}
                      </dt>
                      <dd className="mt-2 leading-5 text-[#c8cbd1]">
                        {support}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#777d88]">
                        {t.hiddenLabel}
                      </dt>
                      <dd className="mt-2 leading-5 text-[#c8cbd1]">
                        {t.hidden[hiddenFrom || "unclear"]}
                      </dd>
                    </div>
                  </dl>
                </aside>
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-[#373b43] bg-[#1b1d22] p-5 sm:p-6">
                <label
                  htmlFor="session-note"
                  className="text-sm font-semibold text-[#e8e4dc]"
                >
                  {t.noteLabel}
                </label>
                <Textarea
                  id="session-note"
                  value={nextSessionNote}
                  maxLength={280}
                  onChange={(event) => {
                    setNextSessionNote(event.target.value);
                    setSaved(false);
                  }}
                  placeholder={t.notePlaceholder}
                  className="mt-3 min-h-24 border-[#3a3e47] bg-[#14161a] text-[#eeeae2] placeholder:text-[#676d78] focus:border-[#d28751] focus:ring-[#d28751]/15"
                />
                <p className="mt-2 text-right font-mono text-[10px] text-[#747a85]">
                  {nextSessionNote.length}/280
                </p>
              </div>

              {saved && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-[#765039] bg-[#2b231f] px-4 py-3 text-sm text-[#e1c5b0]"
                >
                  <Check className="mr-2 inline size-4" />
                  {t.saved}
                </p>
              )}

              {/* O trabalho acaba na Formação, nunca directamente na partilha.
                  A pessoa vê a planta que construiu antes de decidir o destino
                  dela — é a diferença entre escolher e ser encaminhada (§7.2). */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forming")}
                  className={emberButton}
                >
                  {locale === "pt-PT" ? "Ver a planta" : "Ver a planta"}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="enter mt-6 rounded-xl border border-[#8f5139] bg-[#2e201c] px-4 py-3 text-sm text-[#f0b18a]"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#30333a] bg-[#15171b] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            {stage > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStage((current) => Math.max(0, current - 1));
                  setError(null);
                }}
                className={quietButton}
              >
                <ArrowLeft className="size-4" />
                {t.back}
              </button>
            )}
          </div>
          {stage < 4 && (
            <button type="button" onClick={advance} className={emberButton}>
              {t.continue}
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 px-2 text-[11px] leading-5 text-[#777d88] sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <LockKeyhole className="size-3.5 text-[#b9784d]" />
          {t.local}
        </span>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="size-3.5 text-[#b9784d]" />
          {t.metricNote}
        </span>
      </div>
    </section>
  );
}
