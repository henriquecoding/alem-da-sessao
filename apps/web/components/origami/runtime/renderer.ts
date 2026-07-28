import {
  decodeTrack,
  type CompiledOrigamiAsset,
  type DecodedTrack,
} from "./asset";
import { readPaperColours, type PaperColours } from "./colour";
import {
  createContext,
  createProgram,
  orthographicViewProjection,
  type GlResources,
} from "./program";

/**
 * O renderizador. Faz uma coisa e recusa-se a fazer mais.
 *
 * Recebe dois índices de frame e uma mistura, e desenha. Não resolve física,
 * não decide o que a cena significa, não guarda estado da experiência, e não
 * corre quando não há nada a mudar.
 *
 * ## Porquê WebGL2 próprio e não Three.js
 *
 * O problema é pequeno: quatro modelos, dezenas de triângulos, uma câmara fixa,
 * uma luz fixa, sem interação. Three.js resolvê-lo-ia — e traria um runtime
 * maior do que a experiência inteira da homepage, num projeto cujo
 * `check:budgets` existe precisamente para o Care OS não arrastar bibliotecas
 * de animação. Estes quatro ficheiros somam menos do que o `import` do Three.
 *
 * Se em algum momento for preciso mais do que isto — sombras a sério, várias
 * luzes, materiais — a resposta certa é `three` por `dynamic import` só no
 * hero, e não fazer crescer isto até ser um motor.
 *
 * ## A track não se recarrega
 *
 * A animação inteira vive num único buffer estático. Mudar de keyframe é mudar
 * o *offset* do atributo, não escrever para a GPU. Uma transição de quarenta
 * frames faz zero uploads — e é isso que permite ao orçamento de desenho ser
 * uma chamada por cena.
 */

/**
 * `uniform3fv` quer um array mutável e os vetores do asset são tuplos
 * `readonly`. Copiar é mais honesto do que um `as number[]`: o cast diria ao
 * TypeScript que o GL não escreve no array, e ninguém verificou isso.
 */
function vec3(values: readonly [number, number, number]): Float32Array {
  return Float32Array.of(values[0], values[1], values[2]);
}

const POSITION_A = 0;
const POSITION_B = 1;
const NORMAL_A = 2;
const NORMAL_B = 3;

export type RenderSnapshot = {
  readonly frameA: number;
  readonly frameB: number;
  readonly mix: number;
  readonly opacity: number;
};

export class OrigamiRenderer {
  private resources: GlResources | null = null;
  private track: DecodedTrack;
  private positionBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private viewProjection: Float32Array | null = null;
  private colours: PaperColours | null = null;
  private lastFrameA = -1;
  private lastFrameB = -1;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly asset: CompiledOrigamiAsset,
  ) {
    this.track = decodeTrack(asset.track);
  }

  /** `null` quando o dispositivo não dá WebGL2. Quem chama mostra o fallback. */
  static create(
    canvas: HTMLCanvasElement,
    asset: CompiledOrigamiAsset,
  ): OrigamiRenderer | null {
    const renderer = new OrigamiRenderer(canvas, asset);
    return renderer.acquire() ? renderer : null;
  }

  /**
   * Cria — ou recria — tudo o que vive na GPU.
   *
   * Separado do construtor porque é exatamente isto que tem de correr outra vez
   * depois de `webglcontextrestored`. Um contexto perdido invalida todos os
   * objetos GL, e recriá-los é a diferença entre a cena voltar e a cena ficar
   * preta até alguém recarregar a página.
   */
  acquire(): boolean {
    const gl = createContext(this.canvas);
    if (!gl) return false;

    const resources = createProgram(gl);
    if (!resources) return false;
    this.resources = resources;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.track.positions, gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.track.normals, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.asset.triangles),
      gl.STATIC_DRAW,
    );

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    for (const location of [POSITION_A, POSITION_B, NORMAL_A, NORMAL_B]) {
      gl.enableVertexAttribArray(location);
    }
    gl.bindVertexArray(null);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // Sem culling: a frente e o avesso do papel são ambos visíveis e têm
    // material próprio. Cortar as faces de trás apagaria metade do objeto.
    gl.disable(gl.CULL_FACE);

    this.lastFrameA = -1;
    this.lastFrameB = -1;
    this.readColours();
    return true;
  }

  /** Relê os tokens de papel. Chamar quando o tema ou a família mudam. */
  readColours(): void {
    this.colours = readPaperColours(this.canvas.parentElement ?? this.canvas);
  }

  /**
   * Ajusta o buffer de desenho ao tamanho real em pixels.
   *
   * O DPR é limitado a 2. Acima disso o custo cresce com o quadrado e a
   * diferença não se vê num objeto de dezenas de triângulos — mas a memória de
   * GPU num telemóvel com DPR 3 e um canvas grande é bem real.
   */
  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(cssWidth * ratio));
    const height = Math.max(1, Math.round(cssHeight * ratio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.viewProjection = orthographicViewProjection(
      this.asset.camera.viewDirection,
      this.asset.camera.up,
      this.asset.camera.center,
      this.asset.camera.halfExtent,
      width / height,
    );
  }

  private bindFrame(
    gl: WebGL2RenderingContext,
    frame: number,
    positionLocation: number,
    normalLocation: number,
  ): void {
    const vertices = this.track.vertexCount;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(
      positionLocation,
      3,
      gl.SHORT,
      false,
      6,
      frame * vertices * 6,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(
      normalLocation,
      3,
      gl.BYTE,
      true,
      3,
      frame * vertices * 3,
    );
  }

  render(snapshot: RenderSnapshot): void {
    const resources = this.resources;
    const viewProjection = this.viewProjection;
    if (!resources || !viewProjection || !this.colours) return;

    const { gl, program, uniforms } = resources;
    if (gl.isContextLost()) return;

    gl.bindVertexArray(this.vao);

    const frameA = this.clampFrame(snapshot.frameA);
    const frameB = this.clampFrame(snapshot.frameB);
    if (frameA !== this.lastFrameA) {
      this.bindFrame(gl, frameA, POSITION_A, NORMAL_A);
      this.lastFrameA = frameA;
    }
    if (frameB !== this.lastFrameB) {
      this.bindFrame(gl, frameB, POSITION_B, NORMAL_B);
      this.lastFrameB = frameB;
    }

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform1f(uniforms.u_mix!, snapshot.mix);
    gl.uniform1f(uniforms.u_opacity!, snapshot.opacity);
    gl.uniform3fv(uniforms.u_scale!, vec3(this.asset.track.scale));
    gl.uniform3fv(uniforms.u_offset!, vec3(this.asset.track.offset));
    gl.uniformMatrix4fv(uniforms.u_viewProjection!, false, viewProjection);

    const light = this.asset.lighting;
    gl.uniform3fv(uniforms.u_keyDirection!, vec3(light.keyDirection));
    gl.uniform3fv(uniforms.u_fillDirection!, vec3(light.fillDirection));
    gl.uniform1f(uniforms.u_ambient!, light.ambient);
    gl.uniform1f(uniforms.u_key!, light.key);
    gl.uniform1f(uniforms.u_fill!, light.fill);

    gl.uniform3fv(uniforms.u_frontLit!, vec3(this.colours.frontLit));
    gl.uniform3fv(uniforms.u_frontShade!, vec3(this.colours.frontShade));
    gl.uniform3fv(uniforms.u_backLit!, vec3(this.colours.backLit));
    gl.uniform3fv(uniforms.u_backShade!, vec3(this.colours.backShade));

    gl.drawElements(
      gl.TRIANGLES,
      this.asset.triangles.length,
      gl.UNSIGNED_SHORT,
      0,
    );
    gl.bindVertexArray(null);
  }

  private clampFrame(frame: number): number {
    return Math.max(0, Math.min(this.track.frameCount - 1, Math.round(frame)));
  }

  dispose(): void {
    const gl = this.resources?.gl;
    if (!gl) return;

    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteBuffer(this.indexBuffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.resources?.program ?? null);

    this.resources = null;
    this.positionBuffer = null;
    this.normalBuffer = null;
    this.indexBuffer = null;
    this.vao = null;
  }
}
