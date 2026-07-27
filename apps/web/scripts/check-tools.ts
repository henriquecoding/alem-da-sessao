import {
  MAX_ESTIMATED_MINUTES,
  guestModeIsPermitted,
  toolRegistry,
  type ToolManifest,
} from "@alem-da-sessao/tool-registry";
import { locales } from "@alem-da-sessao/i18n";

/**
 * `check:tools` — relatório v2 §10.5.
 *
 * O contrato de originalidade (§4.6) só protege o produto se for uma restrição
 * de engenharia. Um manifesto sem `humanTruth`, `metaphor`, `gesture`,
 * `artifact`, `visualDirection` ou `differentiation` não passa no build. É a
 * única forma de a alma do produto sobreviver ao dia em que houver pressa.
 */

const failures: string[] = [];

function fail(tool: ToolManifest, message: string) {
  failures.push(`${tool.id}: ${message}`);
}

/** Campos livres que não podem ser preenchidos com um espaço para passar. */
function requireProse(tool: ToolManifest, field: string, value: string) {
  if (value.trim().length < 24) {
    fail(
      tool,
      `originality.${field} tem de ser uma frase real (mínimo 24 caracteres), não um marcador.`,
    );
  }
}

// Alargado para `ToolManifest`: `as const` no registry estreita cada campo ao
// seu literal, e um check que só sabe verificar os valores que já lá estão não
// verifica nada.
const manifests: readonly ToolManifest[] = toolRegistry;

for (const tool of manifests) {
  // §5.3 — duração é inimiga. Teto duro, não recomendação.
  if (tool.estimatedMinutes > MAX_ESTIMATED_MINUTES) {
    fail(
      tool,
      `estimatedMinutes ${tool.estimatedMinutes} excede o teto de ${MAX_ESTIMATED_MINUTES} (Lattie et al. 2025).`,
    );
  }

  if (tool.estimatedMinutes <= 0) {
    fail(tool, "estimatedMinutes tem de ser positivo.");
  }

  // §10.3 — as duas localizações fundadoras, completas.
  for (const locale of locales) {
    if (!tool.locales.includes(locale)) {
      fail(tool, `locales não inclui ${locale}.`);
    }
    if (!tool.title[locale]?.trim()) {
      fail(tool, `title.${locale} em falta.`);
    }
    if (!tool.summary[locale]?.trim()) {
      fail(tool, `summary.${locale} em falta.`);
    }
  }

  // §4.1 — o artefacto é obrigatório e obrigatoriamente determinístico.
  if (tool.artifact.deterministic !== true) {
    fail(tool, "artifact.deterministic tem de ser true.");
  }
  if (tool.artifact.format !== "svg") {
    fail(tool, "artifact.format tem de ser svg (§1.6: custo marginal ≈ 0).");
  }
  if (!tool.artifact.renderer) {
    fail(tool, "artifact.renderer em falta.");
  }

  // §4.6 — contrato de originalidade.
  requireProse(tool, "humanTruth", tool.originality.humanTruth);
  requireProse(tool, "metaphor", tool.originality.metaphor);
  requireProse(tool, "gesture", tool.originality.gesture);
  requireProse(tool, "differentiation", tool.originality.differentiation);

  if (Object.keys(tool.originality.visualDirection.palette).length < 2) {
    fail(
      tool,
      "originality.visualDirection.palette precisa de uma paleta própria derivada dos tokens.",
    );
  }
  if (tool.originality.visualDirection.bundleBudgetKb <= 0) {
    fail(
      tool,
      "originality.visualDirection.bundleBudgetKb tem de declarar um orçamento verificável.",
    );
  }

  // §10.3 — a regra derivada: publicar sem gate é impossível.
  if (!guestModeIsPermitted(tool)) {
    fail(
      tool,
      "canRunAsGuest: true exige canSelfStart !== false (§4.9). Não se oferece publicamente uma experiência que não passou pelo gate.",
    );
  }

  // §4.9 — o gate, quando existe, tem de estar completo.
  const gate = tool.capabilities.canSelfStart;
  if (gate !== false) {
    if (!gate.reviewedBy.trim()) {
      fail(tool, "canSelfStart.reviewedBy em falta.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(gate.reviewedAt)) {
      fail(tool, `canSelfStart.reviewedAt inválido: ${gate.reviewedAt}.`);
    }
    for (const locale of locales) {
      if (!gate.crisisResourcesLocale.includes(locale)) {
        fail(
          tool,
          `canSelfStart.crisisResourcesLocale não cobre ${locale}. Recursos de crise são por locale (§4.9).`,
        );
      }
    }
    if (gate.unattendedNotice !== true) {
      fail(
        tool,
        "canSelfStart.unattendedNotice tem de ser true: o aviso de não-monitorização é obrigatório.",
      );
    }
  }

  // §4.10 — o rascunho nunca sai da memória do browser.
  if (tool.dataPolicy.draftStorage !== "memory") {
    fail(tool, "dataPolicy.draftStorage tem de ser memory (ADR-004, §4.10).");
  }

  // §7.7 — analytics nunca derivam de conteúdo.
  const allowedAnalytics = new Set(["opened", "completed", "shared"]);
  for (const event of tool.dataPolicy.analytics) {
    if (!allowedAnalytics.has(event)) {
      fail(tool, `analytics inclui evento não permitido: ${event}.`);
    }
  }
}

const slugs = toolRegistry.map((tool) => tool.slug);
const duplicated = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicated.length) {
  failures.push(`slugs duplicados: ${duplicated.join(", ")}`);
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`check:tools — ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `check:tools passou para ${toolRegistry.length} experiências (contrato de originalidade, gate de auto-iniciação, artefacto determinístico).`,
  );
}
