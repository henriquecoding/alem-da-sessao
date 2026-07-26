export type ToolStatus =
  "draft" | "clinical-review" | "demo-ready" | "published" | "retired";

export type ToolManifest = {
  id: string;
  slug: string;
  version: `${number}.${number}.${number}`;
  status: ToolStatus;
  title: {
    "pt-PT": string;
    "pt-BR": string;
  };
  summary: {
    "pt-PT": string;
    "pt-BR": string;
  };
  estimatedMinutes: number;
  audience: readonly ("client" | "professional")[];
  capabilities: {
    canSelfStart: boolean;
    canAssign: boolean;
    supportsDraftSave: boolean;
    supportsShare: boolean;
    supportsExport: boolean;
  };
  dataPolicy: {
    draftStorage: "memory";
    savedClassification: "HEALTH_SENSITIVE";
    shareMode: "snapshot";
    analytics: readonly ("opened" | "completed" | "shared")[];
  };
  review: {
    clinicalStatus: "pending" | "approved";
    privacyStatus: "approved";
  };
};

export const toolRegistry = [
  {
    id: "load-structures",
    slug: "estruturas-de-carga",
    version: "0.2.0",
    status: "demo-ready",
    title: {
      "pt-PT": "Estruturas de Carga",
      "pt-BR": "Estruturas de Carga",
    },
    summary: {
      "pt-PT":
        "Observe o que sustenta, como a estrutura responde e onde o apoio pode ser redistribuído.",
      "pt-BR":
        "Observe o que você sustenta, como a estrutura responde e onde o apoio pode ser redistribuído.",
    },
    estimatedMinutes: 8,
    audience: ["client", "professional"],
    capabilities: {
      canSelfStart: true,
      canAssign: true,
      supportsDraftSave: true,
      supportsShare: true,
      supportsExport: false,
    },
    dataPolicy: {
      draftStorage: "memory",
      savedClassification: "HEALTH_SENSITIVE",
      shareMode: "snapshot",
      analytics: ["opened", "completed", "shared"],
    },
    review: {
      clinicalStatus: "pending",
      privacyStatus: "approved",
    },
  },
  {
    id: "session-inventory",
    slug: "inventario-da-sessao",
    version: "0.2.0",
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
    audience: ["client"],
    capabilities: {
      canSelfStart: true,
      canAssign: true,
      supportsDraftSave: true,
      supportsShare: true,
      supportsExport: false,
    },
    dataPolicy: {
      draftStorage: "memory",
      savedClassification: "HEALTH_SENSITIVE",
      shareMode: "snapshot",
      analytics: ["opened", "completed", "shared"],
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
