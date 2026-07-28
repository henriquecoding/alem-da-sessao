import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  boundsAcrossFrames,
  dequantizeFrame,
  quantizationError,
  quantizeTrack,
  type Vec3,
} from "@alem-da-sessao/origami-core";
import {
  decodeTrack,
  isCompiledAsset,
} from "@/components/origami/runtime/asset";

/**
 * Os assets que estão no repositório, verificados como estão.
 *
 * A diferença em relação ao teste que isto substitui: aquele contava polígonos
 * de um SVG desenhado à mão, e passava com dez triângulos aleatórios. Estes
 * verificam que o ficheiro que o browser vai carregar corresponde ao
 * `source.fold` que está ao lado dele, e que a simulação que o produziu ficou
 * dentro dos limites.
 */

const ROOT = join(process.cwd(), "public", "origami");

async function modelIds(): Promise<string[]> {
  const entries = await readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const ids = await modelIds();

describe("assets compilados", () => {
  it("existe pelo menos um modelo compilado", () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  it.each(ids)("%s tem um asset com o formato esperado", async (id) => {
    const raw = await readFile(join(ROOT, id, "model.ors.json"), "utf8");
    const asset: unknown = JSON.parse(raw);

    expect(isCompiledAsset(asset)).toBe(true);
    if (!isCompiledAsset(asset)) return;

    expect(asset.modelId).toBe(id);
    expect(asset.sourceFoldSpec).toBe(1.2);
    expect(asset.triangles.length % 3).toBe(0);
    expect(asset.clips.length).toBeGreaterThan(0);
  });

  /**
   * O ficheiro derivado não pode virar fonte paralela.
   *
   * Se alguém editar o `.fold` sem recompilar — ou pior, editar o `.ors.json` à
   * mão para corrigir uma forma — os hashes divergem e isto falha. É o que
   * garante que a frase «a forma vem da folha» continua verdadeira daqui a
   * seis meses.
   */
  it.each(ids)("%s corresponde ao seu source.fold", async (id) => {
    const source = await readFile(join(ROOT, id, "source.fold"), "utf8");
    const raw = await readFile(join(ROOT, id, "model.ors.json"), "utf8");
    const asset = JSON.parse(raw) as { sourceSha256: string };

    expect(asset.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(createHash("sha256").update(source).digest("hex")).toBe(
      asset.sourceSha256,
    );
  });

  it.each(ids)("%s saiu de uma folha quadrada e íntegra", async (id) => {
    const source = JSON.parse(
      await readFile(join(ROOT, id, "source.fold"), "utf8"),
    ) as {
      file_spec: number;
      "ads:paper": { uncut: boolean; aspect: number };
      edges_assignment: string[];
      vertices_coords: number[][];
    };

    expect(source.file_spec).toBe(1.2);
    expect(source["ads:paper"].uncut).toBe(true);
    expect(source["ads:paper"].aspect).toBe(1);
    expect(source.edges_assignment).not.toContain("C");

    const xs = source.vertices_coords.map((point) => point[0]!);
    const ys = source.vertices_coords.map((point) => point[1]!);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(1, 9);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(1, 9);
  });

  it.each(ids)("%s está dentro dos limites de simulação", async (id) => {
    const asset = JSON.parse(
      await readFile(join(ROOT, id, "model.ors.json"), "utf8"),
    ) as { diagnostics: Record<string, number> };

    expect(asset.diagnostics.maxEdgeStrain).toBeLessThanOrEqual(0.0025);
    expect(asset.diagnostics.selfIntersectionCount).toBe(0);
    expect(asset.diagnostics.degenerateTriangleCount).toBe(0);
    expect(asset.diagnostics.quantizationError).toBeLessThan(1e-4);
  });

  it.each(ids)(
    "%s traz um fallback com as mesmas cores do tema",
    async (id) => {
      const asset = JSON.parse(
        await readFile(join(ROOT, id, "model.ors.json"), "utf8"),
      ) as { fallback: { svg: string; viewBox: string } };

      expect(asset.fallback.svg).toContain("<polygon");
      // O fallback tem de continuar a responder ao tema sem JavaScript: as cores
      // são tokens, não valores compilados.
      expect(asset.fallback.svg).toContain("var(--paper-");
      expect(asset.fallback.viewBox).toMatch(/^0 0 \d+ \d+$/);
    },
  );

  it.each(ids)("%s regista proveniência e aprovação por rever", async (id) => {
    const provenance = JSON.parse(
      await readFile(join(ROOT, id, "provenance.json"), "utf8"),
    ) as {
      license: { attribution: string };
      approval: Record<string, boolean>;
    };

    expect(provenance.license.attribution).toContain("OrigamiSimulator");
    // Enquanto a homepage não mudar, nenhuma aprovação humana foi registada — e
    // o ficheiro tem de o dizer em vez de ter campos vazios.
    expect(Object.values(provenance.approval).some(Boolean)).toBe(false);
  });
});

describe("descodificação no browser", () => {
  /**
   * O descodificador do runtime é escrito à mão para o browser não ter de
   * importar o pacote de autoria. Isto é o que impede as duas metades de
   * divergirem em silêncio.
   */
  it("é o inverso exato do codificador", () => {
    const frames: Vec3[][] = [
      [
        [-0.5, -0.5, 0],
        [0.5, 0.5, 0.25],
      ],
      [
        [-0.4, -0.45, 0.1],
        [0.42, 0.48, 0.2],
      ],
    ];
    const normals: Vec3[][] = [
      [
        [0, 0, 1],
        [0, 1, 0],
      ],
      [
        [1, 0, 0],
        [0, 0, -1],
      ],
    ];

    const track = quantizeTrack(frames, normals);
    const decoded = decodeTrack(track);

    expect(decoded.frameCount).toBe(2);
    expect(decoded.vertexCount).toBe(2);
    expect(decoded.positions.length).toBe(2 * 2 * 3);

    // Os mesmos inteiros que `dequantizeFrame` lê no lado da autoria.
    for (let frame = 0; frame < frames.length; frame += 1) {
      const reference = dequantizeFrame(track, frame);
      for (let vertex = 0; vertex < 2; vertex += 1) {
        for (let axis = 0; axis < 3; axis += 1) {
          const raw = decoded.positions[(frame * 2 + vertex) * 3 + axis]!;
          const value =
            (raw + 32767) * track.scale[axis]! + track.offset[axis]!;
          expect(value).toBeCloseTo(reference[vertex]![axis]!, 12);
        }
      }
    }
  });

  it("mantém o erro de quantização abaixo do visível", () => {
    const frames: Vec3[][] = [
      [
        [-0.5, -0.5, 0],
        [0.5, 0.5, 0.25],
      ],
    ];
    const track = quantizeTrack(frames, frames);
    // A folha mede 1. Um erro de 1e-4 é um décimo de milésimo do lado — bem
    // abaixo de um pixel na escala do hero.
    expect(quantizationError(track, frames)).toBeLessThan(1e-4);
  });

  it("não divide por zero num eixo sem extensão", () => {
    // Uma folha perfeitamente plana tem `z` constante em todos os frames.
    const flat: Vec3[][] = [
      [
        [-0.5, -0.5, 0],
        [0.5, 0.5, 0],
      ],
    ];
    const { min, max } = boundsAcrossFrames(flat);
    expect(max[2] - min[2]).toBe(0);

    const track = quantizeTrack(flat, flat);
    for (const value of dequantizeFrame(track, 0).flat()) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});
