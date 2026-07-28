import type { Vec3 } from "./fold-types";

/**
 * Compressão da timeline: de `Float64` para `Int16`, e das normais para `Int8`.
 *
 * A conta que justifica isto: um modelo com 200 vértices e 25 frames guardado
 * como texto JSON de números em vírgula flutuante ocupa cerca de 300 kB. O
 * orçamento por modelo é 28 kB comprimido. Quantizar para `Int16` divide por
 * quatro antes de qualquer compressão, e o erro que introduz é conhecido e
 * medido — `quantizationError` devolve-o em unidades do modelo, e o compilador
 * recusa-se a emitir um asset em que esse erro seja visível à escala do hero.
 *
 * A escala e o deslocamento são globais a todos os frames, e não por frame. Se
 * fossem por frame, dois frames adjacentes teriam grelhas diferentes e a
 * interpolação entre eles produziria um tremor de sub-pixel — barato de
 * calcular e impossível de não ver num objeto parado.
 *
 * O descodificador correspondente vive em
 * `apps/web/components/origami/runtime/buffers.ts`. São dez linhas, e é
 * deliberado que sejam duplicadas em vez de partilhadas: partilhá-las
 * obrigaria o browser a importar este pacote, que é exatamente o que o gate de
 * fronteira existe para impedir.
 */

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function bytesToBase64(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = bytes[index + 1];
    const c = bytes[index + 2];

    output += BASE64_ALPHABET[a >> 2];
    output += BASE64_ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)];
    output +=
      b === undefined
        ? "="
        : BASE64_ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)];
    output += c === undefined ? "=" : BASE64_ALPHABET[c & 63];
  }
  return output;
}

export function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/=+$/, "");
  const bytes = new Uint8Array((clean.length * 3) / 4);
  let cursor = 0;
  let buffer = 0;
  let bits = 0;

  for (const character of clean) {
    const index = BASE64_ALPHABET.indexOf(character);
    if (index < 0) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[cursor++] = (buffer >> bits) & 0xff;
    }
  }

  return bytes.subarray(0, cursor);
}

export type QuantizedTrack = {
  readonly frameCount: number;
  readonly vertexCount: number;
  /** Unidades do modelo por passo do inteiro, por eixo. */
  readonly scale: Vec3;
  /** O canto mínimo da caixa que envolve todos os frames. */
  readonly offset: Vec3;
  /** `Int16Array`, `frameCount × vertexCount × 3`, em ordem de frame. */
  readonly positionsBase64: string;
  /** `Int8Array`, mesma cardinalidade; cada componente em `[-127, 127]`. */
  readonly normalsBase64: string;
};

const INT16_RANGE = 65534;

export function boundsAcrossFrames(frames: readonly (readonly Vec3[])[]): {
  min: Vec3;
  max: Vec3;
} {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (const frame of frames) {
    for (const point of frame) {
      for (let axis = 0; axis < 3; axis += 1) {
        min[axis] = Math.min(min[axis]!, point[axis]!);
        max[axis] = Math.max(max[axis]!, point[axis]!);
      }
    }
  }

  return { min, max };
}

export function quantizeTrack(
  positionFrames: readonly (readonly Vec3[])[],
  normalFrames: readonly (readonly Vec3[])[],
): QuantizedTrack {
  const { min, max } = boundsAcrossFrames(positionFrames);
  const vertexCount = positionFrames[0]?.length ?? 0;

  // Um eixo sem extensão — uma folha perfeitamente plana tem `z` constante —
  // daria divisão por zero. A escala mínima mantém o eixo utilizável e o erro
  // nele é exatamente zero, porque todos os valores são iguais.
  const scale: Vec3 = [
    Math.max((max[0] - min[0]) / INT16_RANGE, 1e-9),
    Math.max((max[1] - min[1]) / INT16_RANGE, 1e-9),
    Math.max((max[2] - min[2]) / INT16_RANGE, 1e-9),
  ];

  const positions = new Int16Array(positionFrames.length * vertexCount * 3);
  let cursor = 0;
  for (const frame of positionFrames) {
    for (const point of frame) {
      for (let axis = 0; axis < 3; axis += 1) {
        const normalized = (point[axis]! - min[axis]!) / scale[axis]! - 32767;
        positions[cursor++] = Math.max(
          -32767,
          Math.min(32767, Math.round(normalized)),
        );
      }
    }
  }

  const normals = new Int8Array(normalFrames.length * vertexCount * 3);
  cursor = 0;
  for (const frame of normalFrames) {
    for (const normal of frame) {
      for (let axis = 0; axis < 3; axis += 1) {
        normals[cursor++] = Math.max(
          -127,
          Math.min(127, Math.round(normal[axis]! * 127)),
        );
      }
    }
  }

  return {
    frameCount: positionFrames.length,
    vertexCount,
    scale,
    offset: min,
    positionsBase64: bytesToBase64(new Uint8Array(positions.buffer)),
    normalsBase64: bytesToBase64(new Uint8Array(normals.buffer)),
  };
}

/** O par de `quantizeTrack`. Existe para os testes verificarem o erro real. */
export function dequantizeFrame(
  track: QuantizedTrack,
  frameIndex: number,
): Vec3[] {
  const bytes = base64ToBytes(track.positionsBase64);
  const values = new Int16Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength / 2,
  );

  const stride = track.vertexCount * 3;
  const start = frameIndex * stride;
  const points: Vec3[] = [];

  for (let vertex = 0; vertex < track.vertexCount; vertex += 1) {
    const base = start + vertex * 3;
    points.push([
      (values[base]! + 32767) * track.scale[0] + track.offset[0],
      (values[base + 1]! + 32767) * track.scale[1] + track.offset[1],
      (values[base + 2]! + 32767) * track.scale[2] + track.offset[2],
    ]);
  }

  return points;
}

/** O maior erro que a quantização introduz, em unidades do modelo. */
export function quantizationError(
  track: QuantizedTrack,
  frames: readonly (readonly Vec3[])[],
): number {
  let maximum = 0;
  for (let index = 0; index < frames.length; index += 1) {
    const decoded = dequantizeFrame(track, index);
    const original = frames[index]!;
    for (let vertex = 0; vertex < original.length; vertex += 1) {
      for (let axis = 0; axis < 3; axis += 1) {
        maximum = Math.max(
          maximum,
          Math.abs(decoded[vertex]![axis]! - original[vertex]![axis]!),
        );
      }
    }
  }
  return maximum;
}
