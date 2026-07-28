import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  guestModeIsPermitted,
  toolRegistry,
  type ToolManifest,
} from "@alem-da-sessao/tool-registry";
import {
  renderLoadStructuresPlan,
  renderSessionInventoryConstellation,
} from "@alem-da-sessao/tool-registry/artifact";
import {
  toProfessionalView,
  type CareInterval,
} from "@alem-da-sessao/db/intervals";

/**
 * Os sete invariantes do relatório v2 §10.6.
 *
 * Estes não são testes de funcionalidade: são testes de que certas coisas
 * continuam impossíveis. Um teste de funcionalidade que falha diz que uma
 * feature partiu; um destes a falhar diz que o modelo de privacidade caiu.
 */

const manifests: readonly ToolManifest[] = toolRegistry;
const repoRoot = join(process.cwd(), "..", "..");

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("invariantes do modelo de dados (§10.6)", () => {
  it("1. uma run pessoal nunca pertence a um intervalo, mesmo havendo relação de cuidado", () => {
    // A constraint que o garante vive na base, não na aplicação: uma run em C2
    // não tem intervalo porque intervalos só existem dentro de uma relação.
    const migration = readFileSync(
      join(
        repoRoot,
        "supabase/clinical/migrations/202607270002_intervals_and_bridges.sql",
      ),
      "utf8",
    );

    expect(migration).toContain("runs_origin_interval_coherent");
    expect(migration).toMatch(
      /origin in \('personal', 'guest_converted'\)\s+and interval_id is null/,
    );
  });

  it("2. criar relação de cuidado não altera a visibilidade de runs pré-existentes", () => {
    // A projeção profissional é o único canal, e ela não transporta artefactos
    // nem pontes não partilhadas — independentemente de quando foram criados.
    const interval: CareInterval = {
      id: "interval_test",
      state: "open",
      opensAt: "2026-03-01T10:00:00.000Z",
      closesAt: null,
      artifactCount: 3,
      bridges: [
        {
          direction: "outgoing",
          body: "escrito em março, muito antes da relação",
          writtenAt: "2026-03-01T21:00:00.000Z",
          shared: false,
        },
      ],
    };

    const view = toProfessionalView(interval);

    expect(view).not.toHaveProperty("artifactCount");
    expect(view).not.toHaveProperty("bridges");
    expect(JSON.stringify(view)).not.toContain("março");
    expect(view.sharedSnapshotCount).toBe(0);
  });

  it("3. uma experiência de convidado não escreve nada no servidor antes da conta", () => {
    for (const engine of [
      "components/session-inventory-experience.tsx",
      "components/experience-runtime/arrival.tsx",
      "components/experience-runtime/destination.tsx",
      "components/experience-runtime/artifact-view.tsx",
    ]) {
      const source = read(engine);
      expect(source, `${engine} não pode escrever no servidor`).not.toMatch(
        /fetch\([^)]*method:\s*["']POST/,
      );
      expect(source, `${engine} não pode persistir localmente`).not.toMatch(
        /localStorage|sessionStorage|indexedDB/,
      );
    }

    // O manifesto declara-o, e `check:tools` verifica-o.
    for (const manifest of manifests) {
      if (manifest.capabilities.canRunAsGuest) {
        expect(manifest.dataPolicy.draftStorage).toBe("memory");
      }
    }
  });

  it("4. revogar uma partilha não apaga o que já entrou em retenção, e a interface diz isso antes", () => {
    const receipt = read("components/experience-runtime/share-receipt.tsx");
    // A consequência é declarada no recibo, que existe antes de qualquer
    // revogação — não numa mensagem de erro depois.
    expect(receipt).toMatch(/integrado o regist[or] cl[íi]nico permanece/);

    const sensitivity = read("components/sensitivity.tsx");
    expect(sensitivity).toContain("retained");
  });

  it("5. um intervalo vazio é indistinguível de um intervalo não partilhado", () => {
    const base = {
      id: "interval_test",
      state: "closing" as const,
      opensAt: "2026-07-20T09:20:00.000Z",
      closesAt: "2026-07-27T08:30:00.000Z",
    };

    // Vazio: a pessoa não fez nada.
    const empty: CareInterval = { ...base, artifactCount: 0, bridges: [] };

    // Cheio, mas nada atravessou a ponte.
    const private_: CareInterval = {
      ...base,
      artifactCount: 4,
      bridges: [
        {
          direction: "outgoing",
          body: "algo muito íntimo",
          writtenAt: "2026-07-20T21:00:00.000Z",
          shared: false,
        },
        {
          direction: "incoming",
          body: "outra coisa",
          writtenAt: "2026-07-26T21:00:00.000Z",
          shared: false,
        },
      ],
    };

    // Este é o teste que prova a ausência de vigilância.
    expect(toProfessionalView(empty)).toEqual(toProfessionalView(private_));
  });

  it("6. o motor de busca do diretório não recebe input derivado de conteúdo", () => {
    const directory = read("lib/directory.ts");

    for (const forbidden of [
      "toolRun",
      "sessionBridge",
      "artifactInput",
      "fragments",
    ]) {
      expect(
        directory.toLowerCase(),
        `o diretório não pode conhecer ${forbidden}`,
      ).not.toContain(forbidden.toLowerCase());
    }

    // Os eixos permitidos são exatamente os declarados no §8.2 F3.
    const query = directory.slice(
      directory.indexOf("export type DirectoryQuery"),
      directory.indexOf("export type DirectoryProfile"),
    );
    for (const axis of ["country", "region", "modality", "language", "focus"]) {
      expect(query).toContain(axis);
    }
  });

  it("7. nenhuma rota de experiência carrega script de origem externa", () => {
    for (const file of [
      "components/load-structures-experience.tsx",
      "components/session-inventory-experience.tsx",
      "components/load-structures-community.tsx",
      "components/experience-runtime/crisis-panel.tsx",
    ]) {
      const source = read(file);
      expect(source).not.toMatch(/<script\b[^>]*\bsrc=["']https?:\/\//i);
      expect(source).not.toMatch(
        /connect\.facebook\.net|googletagmanager|google-analytics|analytics\.tiktok/i,
      );
    }
  });
});

describe("invariantes do artefacto (§4.1)", () => {
  it("é determinístico: a mesma entrada produz sempre o mesmo SVG", () => {
    const input = {
      fragments: [
        {
          id: "clear",
          label: "Algo ficou claro",
          state: "clear" as const,
          destination: "revisit" as const,
        },
        {
          id: "silence",
          label: "Um silêncio",
          state: "slow" as const,
          destination: "observe" as const,
        },
      ],
    };
    const meta = {
      toolId: "session-inventory",
      toolVersion: "0.3.0",
      locale: "pt-PT" as const,
      createdAt: "2026-07-27T10:00:00.000Z",
    };

    expect(renderSessionInventoryConstellation(input, meta)).toBe(
      renderSessionInventoryConstellation(input, meta),
    );
  });

  it("escapa o texto da pessoa antes de o pôr no SVG", () => {
    const svg = renderLoadStructuresPlan(
      {
        loads: [
          {
            id: "x",
            label: '<script>alert("x")</script>',
            impactScale: 3,
            durationMonths: 6,
            ownership: "mine",
            movement: "protect",
          },
        ],
        support: "a & b",
        anchored: false,
      },
      {
        toolId: "load-structures",
        toolVersion: "0.4.0",
        locale: "pt-PT",
        createdAt: "2026-07-27T10:00:00.000Z",
      },
    );

    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;");
    expect(svg).toContain("&amp;");
  });

  it("regista forma e não valor: nenhuma resposta torna a planta 'melhor'", () => {
    const meta = {
      toolId: "load-structures",
      toolVersion: "0.4.0",
      locale: "pt-PT" as const,
      createdAt: "2026-07-27T10:00:00.000Z",
    };
    const base = {
      id: "a",
      label: "Uma carga",
      durationMonths: 6,
      ownership: "mine" as const,
    };

    // "Proteger" e "devolver" são movimentos diferentes, não melhores ou
    // piores: produzem remates distintos, nunca uma estrutura mais estável.
    const protect = renderLoadStructuresPlan(
      {
        loads: [{ ...base, impactScale: 1, movement: "protect" }],
        support: "s",
        anchored: false,
      },
      meta,
    );
    const give = renderLoadStructuresPlan(
      {
        loads: [{ ...base, impactScale: 1, movement: "return" }],
        support: "s",
        anchored: false,
      },
      meta,
    );

    expect(protect).not.toBe(give);
    // Nenhum dos dois contém vocabulário de avaliação.
    for (const svg of [protect, give]) {
      expect(svg.toLowerCase()).not.toMatch(/score|nota|n[íi]vel|progresso/);
    }
  });
});

describe("invariantes do manifesto (§10.3)", () => {
  it("demonstrações pendentes só correm no runtime fixture", () => {
    for (const manifest of manifests) {
      expect(guestModeIsPermitted(manifest, "fixture"), manifest.id).toBe(true);
      expect(guestModeIsPermitted(manifest, "production"), manifest.id).toBe(
        false,
      );
    }
  });

  it("nenhuma experiência excede o teto de sete minutos", () => {
    for (const manifest of manifests) {
      expect(manifest.estimatedMinutes, manifest.id).toBeLessThanOrEqual(7);
    }
  });
});
