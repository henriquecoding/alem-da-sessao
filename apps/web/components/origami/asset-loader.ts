import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { isCompiledAsset, type CompiledOrigamiAsset } from "./runtime/asset";

/**
 * Lê um asset compilado no servidor.
 *
 * `server-only` não é decorativo: este ficheiro usa `node:fs`, e importá-lo de
 * um componente de cliente daria um erro de build tardio e confuso. Com a
 * marca, o erro é imediato e diz o que é.
 *
 * A leitura existe para que o **primeiro byte** de HTML já traga a silhueta
 * certa. O fallback SVG sai do mesmo frame da mesma simulação que o canvas vai
 * desenhar, portanto quem nunca chega a ter WebGL vê o mesmo objeto — não uma
 * segunda ilustração a fingir-se da primeira, que era o defeito exato da versão
 * anterior.
 *
 * `cache()` limita a leitura a uma por pedido. O ficheiro é imutável entre
 * deploys: quem o muda corre `origami:compile` e faz commit do resultado.
 */
export const loadCompiledAsset = cache(
  async (modelId: string): Promise<CompiledOrigamiAsset | null> => {
    try {
      const raw = await readFile(
        join(process.cwd(), "public", "origami", modelId, "model.ors.json"),
        "utf8",
      );
      const parsed: unknown = JSON.parse(raw);
      return isCompiledAsset(parsed) ? parsed : null;
    } catch {
      // Um modelo por compilar não é uma exceção — é o estado normal de um
      // modelo que ainda não passou os gates. Quem chama mostra o que tem.
      return null;
    }
  },
);

export type ProvenanceRecord = {
  readonly modelId: string;
  readonly title: string;
  readonly description?: string;
  readonly sourceSha256: string;
  readonly topology: Record<string, number>;
  readonly diagnostics: Record<string, number>;
  readonly approval: Record<string, boolean>;
};

export const loadProvenance = cache(
  async (modelId: string): Promise<ProvenanceRecord | null> => {
    try {
      const raw = await readFile(
        join(process.cwd(), "public", "origami", modelId, "provenance.json"),
        "utf8",
      );
      return JSON.parse(raw) as ProvenanceRecord;
    } catch {
      return null;
    }
  },
);
