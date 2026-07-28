import type { CompiledOrigamiAsset } from "@alem-da-sessao/origami-core";

/**
 * O contrato do lado do browser.
 *
 * Este é o **único** ficheiro do runtime que menciona `@alem-da-sessao/origami-core`,
 * e menciona-o só com `import type`. Com `verbatimModuleSyntax` ligado, um
 * `import type` não sobrevive à compilação: não há `require`, não há chunk, não
 * há um byte do validador nem do solver no bundle. O que fica é a garantia de
 * que o compilador e o runtime falam do mesmo formato — se o asset mudar de
 * forma, o `tsc` falha aqui em vez de o `undefined` aparecer num shader.
 *
 * `check:origami-boundary` verifica exatamente isto: `import type` é permitido,
 * qualquer import de valor falha o build.
 */

export type { CompiledOrigamiAsset };

export type OrigamiClipId = CompiledOrigamiAsset["clips"][number]["id"];

/**
 * Descodifica a track para arrays tipados.
 *
 * O par de `quantizeTrack`, escrito à mão porque partilhá-lo obrigaria o
 * browser a importar o pacote de autoria. São dez linhas e estão cobertas por
 * um teste de ida e volta contra o codificador real.
 */
export function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export type DecodedTrack = {
  readonly frameCount: number;
  readonly vertexCount: number;
  /** `Int16`, `frameCount × vertexCount × 3`. Vai para a GPU tal como está. */
  readonly positions: Int16Array;
  /** `Int8`, mesma cardinalidade. */
  readonly normals: Int8Array;
};

export function decodeTrack(
  track: CompiledOrigamiAsset["track"],
): DecodedTrack {
  const positionBytes = decodeBase64(track.positionsBase64);
  const normalBytes = decodeBase64(track.normalsBase64);

  return {
    frameCount: track.frameCount,
    vertexCount: track.vertexCount,
    // `slice()` e não uma vista: o `Uint8Array` de `atob` pode não estar
    // alinhado a dois bytes, e um `Int16Array` sobre um offset ímpar atira.
    positions: new Int16Array(positionBytes.slice().buffer),
    normals: new Int8Array(normalBytes.slice().buffer),
  };
}

/**
 * Verifica que o ficheiro é o que diz ser antes de o desenhar.
 *
 * Um asset truncado por um deploy a meio produz um `WebGL: INVALID_OPERATION`
 * sem contexto nenhum. Vale mais falhar aqui, com uma frase, e cair para o
 * fallback.
 */
export function isCompiledAsset(value: unknown): value is CompiledOrigamiAsset {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<CompiledOrigamiAsset>;

  return (
    candidate.format === "ads-origami-runtime" &&
    candidate.version === 1 &&
    Array.isArray(candidate.triangles) &&
    candidate.triangles.length > 0 &&
    Array.isArray(candidate.clips) &&
    typeof candidate.track === "object" &&
    candidate.track !== null &&
    typeof candidate.track.positionsBase64 === "string" &&
    typeof candidate.fallback?.svg === "string"
  );
}
