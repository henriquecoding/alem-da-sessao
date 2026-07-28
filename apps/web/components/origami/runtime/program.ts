import { ORIGAMI_FRAGMENT_SHADER, ORIGAMI_VERTEX_SHADER } from "./shaders";

/**
 * Contexto, shaders e a matriz da câmara.
 *
 * Tudo aqui devolve `null` em vez de atirar. Um contexto WebGL pode não existir
 * por razões que não são erros — aceleração desligada, driver na lista negra,
 * browser automatizado, memória de GPU esgotada. Nenhuma delas é motivo para a
 * página deixar de funcionar: são motivo para mostrar o fallback, que contém a
 * mesma informação.
 */

export type GlResources = {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly uniforms: Readonly<Record<string, WebGLUniformLocation | null>>;
};

const UNIFORM_NAMES = [
  "u_mix",
  "u_scale",
  "u_offset",
  "u_viewProjection",
  "u_keyDirection",
  "u_fillDirection",
  "u_ambient",
  "u_key",
  "u_fill",
  "u_frontLit",
  "u_frontShade",
  "u_backLit",
  "u_backShade",
  "u_opacity",
] as const;

export function createContext(
  canvas: HTMLCanvasElement,
): WebGL2RenderingContext | null {
  return canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    depth: true,
    // O palco é CSS por baixo do canvas; compor sobre ele exige alfa
    // pré-multiplicado, que é o que o fragment shader emite.
    premultipliedAlpha: true,
    // Nada aqui precisa de ler o buffer depois de desenhar, e mantê-lo custa
    // memória em cada resize.
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: false,
  });
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "origami: shader não compilou\n",
        gl.getShaderInfoLog(shader),
      );
    }
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function createProgram(gl: WebGL2RenderingContext): GlResources | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, ORIGAMI_VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, ORIGAMI_FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  // Os shaders já estão no programa; manter os objetos só ocupa memória.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "origami: programa não ligou\n",
        gl.getProgramInfoLog(program),
      );
    }
    gl.deleteProgram(program);
    return null;
  }

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (const name of UNIFORM_NAMES) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  return { gl, program, uniforms };
}

type Vec3 = readonly [number, number, number];

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Matriz de vista-projeção ortográfica, em ordem de colunas para o GL.
 *
 * Ortográfica e não perspetiva, e é uma decisão de direção de arte e não de
 * desempenho: a perspetiva dá ao objeto um ponto de vista — alguém *ali*, a
 * olhar — e a cena é de um objeto pousado, não de uma pessoa a observá-lo. A
 * projeção paralela também mantém a silhueta constante quando o modelo aparece
 * a 96 px e a 320 px, que é o que o teste de reconhecimento exige.
 *
 * O `halfExtent` vem do compilador e cobre o **maior** frame da animação, não o
 * último. Ajustar ao resultado faria a folha plana — que é a maior — sair do
 * enquadramento no início.
 */
export function orthographicViewProjection(
  viewDirection: Vec3,
  up: Vec3,
  center: Vec3,
  halfExtent: number,
  aspect: number,
): Float32Array {
  const forward = normalize(viewDirection);
  const right = normalize(cross(forward, up));
  const trueUp = cross(right, forward);

  const distance = Math.max(halfExtent * 4, 1);
  const eye: Vec3 = [
    center[0] - forward[0] * distance,
    center[1] - forward[1] * distance,
    center[2] - forward[2] * distance,
  ];

  const halfWidth = aspect >= 1 ? halfExtent * aspect : halfExtent;
  const halfHeight = aspect >= 1 ? halfExtent : halfExtent / aspect;

  const near = 0;
  const far = distance * 2 + halfExtent * 2;

  // view (mundo → câmara), com a câmara a olhar por −z como o GL espera.
  const view = [
    right[0],
    trueUp[0],
    -forward[0],
    0,
    right[1],
    trueUp[1],
    -forward[1],
    0,
    right[2],
    trueUp[2],
    -forward[2],
    0,
    -dot(right, eye),
    -dot(trueUp, eye),
    dot(forward, eye),
    1,
  ];

  const sx = 1 / halfWidth;
  const sy = 1 / halfHeight;
  const sz = -2 / (far - near);
  const tz = -(far + near) / (far - near);

  // projeção × vista, expandido para não arrastar uma biblioteca de matrizes
  // por causa de uma multiplicação que acontece uma vez por resize.
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    const base = column * 4;
    out[base] = view[base]! * sx;
    out[base + 1] = view[base + 1]! * sy;
    out[base + 2] = view[base + 2]! * sz + view[base + 3]! * tz;
    out[base + 3] = view[base + 3]!;
  }

  return out;
}
