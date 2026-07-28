import type { ArtifactRenderer } from "./artifact";

export type ToolStatus =
  "draft" | "clinical-review" | "demo-ready" | "published" | "retired";

export type ToolLocale = "pt-PT" | "pt-BR";
export type ToolRuntime = "fixture" | "production";

/**
 * O gate de auto-iniciação — relatório v2 §4.9 e §10.3.
 *
 * `canSelfStart` deixou de ser boolean de propósito. Com a porta A aberta,
 * existem pessoas a fazer experiências sozinhas, sem profissional, possivelmente
 * em sofrimento agudo, às 3 da manhã: a imunidade estrutural do §1.3 não as
 * cobre. Sendo um objeto, é **literalmente impossível** ativar a auto-iniciação
 * sem declarar quem reviu clinicamente, em que data, com que tier de risco e
 * com que recursos de crise por locale.
 *
 * `riskTier` não admite `"high"`: risco alto não é auto-iniciável por
 * construção, não por convenção.
 */
export type SelfStartGate =
  | false
  | {
      /** Cédula ou registo profissional do revisor (CP em Portugal, CRP no Brasil). */
      reviewedBy: string;
      reviewedAt: `${number}-${number}-${number}`;
      riskTier: "low" | "moderate";
      crisisResourcesLocale: readonly [ToolLocale, ...ToolLocale[]];
      /** Declara que o aviso de "ninguém está a ver" é mostrado na Chegada. */
      unattendedNotice: true;
    };

/**
 * O artefacto é obrigatório e obrigatoriamente determinístico — §4.1.
 *
 * `deterministic: true` é um tipo literal: não aceita `false`. Mesma entrada,
 * mesma imagem, sempre. Sem aleatoriedade e sem IA generativa, porque um
 * artefacto que muda sozinho deixa de ser um registo da pessoa.
 */
export type ArtifactSpec = {
  renderer: ArtifactRenderer;
  format: "svg";
  deterministic: true;
  exportable: true;
};

/**
 * Contrato de originalidade — §4.6.
 *
 * Sem estes campos o build falha (`check:tools`). Isso torna a alma do produto
 * uma restrição de engenharia em vez de uma boa intenção — a única forma de
 * ela sobreviver ao dia em que houver pressa.
 */
export type OriginalityContract = {
  /** Uma frase, sem jargão clínico. */
  humanTruth: string;
  /** A metáfora, e por que revela o que uma pergunta não revelaria. */
  metaphor: string;
  /** O gesto central da experiência. */
  gesture: string;
  /** Por que isto não é um formulário com ilustração. */
  differentiation: string;
  visualDirection: {
    palette: Record<string, string>;
    editorialFont: string | null;
    /** Orçamento declarado, verificado em `check:budgets`. */
    bundleBudgetKb: number;
  };
};

export type ToolManifest = {
  id: string;
  slug: string;
  version: `${number}.${number}.${number}`;
  status: ToolStatus;
  title: Record<ToolLocale, string>;
  summary: Record<ToolLocale, string>;
  /**
   * Teto duro de 7 minutos, validado em `check:tools`.
   * Lattie et al. (2025): 8–10 minutos já era demais para os participantes.
   */
  estimatedMinutes: number;
  audience: readonly ("public" | "client" | "professional")[];
  locales: readonly [ToolLocale, ...ToolLocale[]];
  capabilities: {
    canSelfStart: SelfStartGate;
    canAssign: boolean;
    /** Porta A: a experiência corre sem conta nenhuma (§4.10). */
    canRunAsGuest: boolean;
    supportsDraftSave: boolean;
    supportsShare: boolean;
    supportsAnonymousPublication: boolean;
    supportsExport: boolean;
  };
  dataPolicy: {
    draftStorage: "memory";
    savedClassification: "HEALTH_SENSITIVE";
    shareMode: "snapshot";
    publicProjection: "none" | "moderated-minimal";
    analytics: readonly ("opened" | "completed" | "shared")[];
  };
  artifact: ArtifactSpec;
  originality: OriginalityContract;
  review: {
    clinicalStatus: "pending" | "approved";
    privacyStatus: "approved";
  };
};

/** Teto do §5.3, aplicado por `check:tools`. */
export const MAX_ESTIMATED_MINUTES = 7;

export const toolRegistry = [
  {
    id: "load-structures",
    slug: "estruturas-de-carga",
    version: "0.4.0",
    status: "demo-ready",
    title: {
      "pt-PT": "Estruturas de Carga",
      "pt-BR": "Estruturas de Carga",
    },
    summary: {
      "pt-PT":
        "Construa uma planta das responsabilidades que sustenta, meça a compressão e ensaie uma ancoragem possível.",
      "pt-BR":
        "Construa uma planta das responsabilidades que você sustenta, meça a compressão e ensaie uma ancoragem possível.",
    },
    estimatedMinutes: 7,
    audience: ["public", "client", "professional"],
    locales: ["pt-PT", "pt-BR"],
    capabilities: {
      // A demonstração local é deliberadamente diferente de aprovação
      // clínica. Enquanto a revisão estiver pendente, produção não pode
      // inferir autorização a partir de texto livre num campo de revisor.
      canSelfStart: false,
      canAssign: true,
      canRunAsGuest: true,
      supportsDraftSave: true,
      supportsShare: true,
      supportsAnonymousPublication: true,
      supportsExport: true,
    },
    dataPolicy: {
      draftStorage: "memory",
      savedClassification: "HEALTH_SENSITIVE",
      shareMode: "snapshot",
      publicProjection: "moderated-minimal",
      analytics: ["opened", "completed", "shared"],
    },
    artifact: {
      renderer: "load-structures-plan",
      format: "svg",
      deterministic: true,
      exportable: true,
    },
    originality: {
      humanTruth:
        "Quem sustenta muita coisa raramente consegue ver o que sustenta — só sente o peso todo junto.",
      metaphor:
        "Uma planta de engenharia: vigas, apoios e vãos. Uma pergunta pede que a pessoa descreva o peso; uma planta mostra-lhe que existe uma configuração, e que configurações mudam.",
      gesture:
        "Assentar cada carga na fundação e depois manter o dedo pousado para ancorar — o tempo do gesto é o tempo de reconhecer.",
      differentiation:
        "Não pontua, não compara e não desaba. A estrutura não fica mais bonita quando a pessoa está melhor: regista forma, não valor.",
      visualDirection: {
        palette: {
          ink: "#15171b",
          surface: "#1c1e23",
          ember: "#d58b57",
          line: "#32353d",
        },
        editorialFont: "system serif stack",
        bundleBudgetKb: 120,
      },
    },
    review: {
      clinicalStatus: "pending",
      privacyStatus: "approved",
    },
  },
  {
    id: "session-inventory",
    slug: "inventario-da-sessao",
    version: "0.3.0",
    status: "demo-ready",
    title: {
      "pt-PT": "Inventário da Sessão",
      "pt-BR": "Inventário da Sessão",
    },
    summary: {
      "pt-PT":
        "Dê forma ao que ficou claro, ao que permaneceu suspenso e ao que quer levar à próxima conversa.",
      "pt-BR":
        "Dê forma ao que ficou claro, ao que permaneceu suspenso e ao que você quer levar à próxima conversa.",
    },
    estimatedMinutes: 6,
    audience: ["public", "client"],
    locales: ["pt-PT", "pt-BR"],
    capabilities: {
      canSelfStart: false,
      canAssign: true,
      canRunAsGuest: true,
      supportsDraftSave: true,
      supportsShare: true,
      supportsAnonymousPublication: false,
      supportsExport: true,
    },
    dataPolicy: {
      draftStorage: "memory",
      savedClassification: "HEALTH_SENSITIVE",
      shareMode: "snapshot",
      publicProjection: "none",
      analytics: ["opened", "completed", "shared"],
    },
    artifact: {
      renderer: "session-inventory-constellation",
      format: "svg",
      deterministic: true,
      exportable: true,
    },
    originality: {
      humanTruth:
        "Quase tudo o que se disse numa sessão desaparece em dias; o que fica são três ou quatro fragmentos soltos.",
      metaphor:
        "Uma constelação: pontos isolados que só ganham figura quando alguém decide ligá-los. Uma pergunta pede um resumo; a constelação aceita que os fragmentos fiquem separados e mesmo assim formem alguma coisa.",
      gesture:
        "Escolher poucos fragmentos e dar a cada um um destino — revisitar, observar, experimentar ou deixar assentar.",
      differentiation:
        "Não pede que a pessoa reconstrua a conversa nem avalie a sessão. Aceita silêncio e confusão como estados legítimos, com o mesmo peso visual de clareza.",
      visualDirection: {
        palette: {
          surface: "#fffcfa",
          lilac: "#ded6fa",
          blue: "#dceaf7",
          aqua: "#d7ecee",
        },
        editorialFont: null,
        bundleBudgetKb: 60,
      },
    },
    review: {
      clinicalStatus: "pending",
      privacyStatus: "approved",
    },
  },
] as const satisfies readonly ToolManifest[];

export function getToolBySlug(slug: string): ToolManifest | undefined {
  return toolRegistry.find((tool) => tool.slug === slug);
}

/**
 * A regra derivada do §10.3, exposta como função para que o check de CI e o
 * runtime partilhem exatamente a mesma definição.
 *
 * Não se pode oferecer publicamente uma experiência que não passou pelo gate
 * de auto-iniciação.
 */
export function guestModeIsPermitted(
  manifest: ToolManifest,
  runtime: ToolRuntime = "production",
): boolean {
  if (!manifest.capabilities.canRunAsGuest) return false;

  if (runtime === "fixture") {
    return manifest.status === "demo-ready" || manifest.status === "published";
  }

  return (
    manifest.status === "published" &&
    manifest.review.clinicalStatus === "approved" &&
    manifest.capabilities.canSelfStart !== false
  );
}

/**
 * Uma ferramenta pode aparecer num catálogo profissional antes de ser
 * publicável. Abrir o motor, porém, continua sujeito ao mesmo gate que a rota.
 */
export function toolCanRun(
  manifest: ToolManifest,
  runtime: ToolRuntime,
  audience: "public" | "client" | "professional",
): boolean {
  if (!manifest.audience.includes(audience)) return false;
  if (runtime === "fixture") return manifest.status === "demo-ready";
  if (manifest.status !== "published") return false;

  return audience === "public"
    ? guestModeIsPermitted(manifest, runtime)
    : manifest.review.clinicalStatus === "approved";
}

export type { ArtifactRenderer };
