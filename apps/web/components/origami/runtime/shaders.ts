/**
 * Os dois shaders. São curtos de propósito.
 *
 * ## O que o vertex shader faz de invulgar
 *
 * Recebe **dois** frames — o anterior e o seguinte — e interpola entre eles com
 * `u_mix`. Nenhum dos dois é carregado a cada frame: a track inteira vive num
 * único buffer estático e mudar de keyframe é mudar o *offset* do atributo. Uma
 * transição de 40 frames não faz uma única escrita para a GPU.
 *
 * As posições chegam como `SHORT` e as normais como `BYTE` normalizado. O
 * `u_scale`/`u_offset` desfaz a quantização dentro do shader, que é onde ela
 * custa zero.
 *
 * ## O que o fragment shader não faz
 *
 * Não tem especular. Papel não brilha, e um realce especular é a diferença mais
 * rápida entre «papel» e «plástico» — foi o defeito que matou a primeira
 * direção deste projeto, em CSS em vez de em GLSL.
 *
 * A cor sai da **normal** da face e de uma luz só. Nenhuma face tem uma cor
 * escolhida à mão: se duas faces têm tons diferentes é porque estão viradas
 * para sítios diferentes. É esta a diferença entre iluminar e pintar.
 *
 * `gl_FrontFacing` distingue a frente do avesso do papel. Não é um truque de
 * sombreado — é literalmente a outra face da folha, e tem família de cor
 * própria.
 */

export const ORIGAMI_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_positionA;
layout(location = 1) in vec3 a_positionB;
layout(location = 2) in vec3 a_normalA;
layout(location = 3) in vec3 a_normalB;

uniform float u_mix;
uniform vec3 u_scale;
uniform vec3 u_offset;
uniform mat4 u_viewProjection;

out vec3 v_normal;

vec3 dequantize(vec3 raw) {
  return (raw + 32767.0) * u_scale + u_offset;
}

void main() {
  vec3 position = mix(dequantize(a_positionA), dequantize(a_positionB), u_mix);
  v_normal = normalize(mix(a_normalA, a_normalB, u_mix));
  gl_Position = u_viewProjection * vec4(position, 1.0);
}
`;

export const ORIGAMI_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec3 v_normal;

uniform vec3 u_keyDirection;
uniform vec3 u_fillDirection;
uniform float u_ambient;
uniform float u_key;
uniform float u_fill;

uniform vec3 u_frontLit;
uniform vec3 u_frontShade;
uniform vec3 u_backLit;
uniform vec3 u_backShade;
uniform float u_opacity;

out vec4 outColor;

// As cores chegam em linear e saem em sRGB. Multiplicar um valor sRGB por um
// termo de Lambert dá faces acinzentadas e um degradê que morre a meio — é o
// erro que faz papel parecer cartolina fotocopiada.
vec3 toSrgb(vec3 linear) {
  vec3 low = linear * 12.92;
  vec3 high = 1.055 * pow(max(linear, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return mix(high, low, step(linear, vec3(0.0031308)));
}

void main() {
  vec3 normal = normalize(gl_FrontFacing ? v_normal : -v_normal);

  float key = max(0.0, dot(normal, u_keyDirection));
  float fill = max(0.0, dot(normal, u_fillDirection));
  float diffuse = clamp(u_ambient + key * u_key + fill * u_fill, 0.0, 1.0);

  vec3 lit = gl_FrontFacing ? u_frontLit : u_backLit;
  vec3 shade = gl_FrontFacing ? u_frontShade : u_backShade;
  vec3 paper = toSrgb(mix(shade, lit, diffuse));

  // Alfa pré-multiplicado: o palco por baixo é CSS, e o canvas compõe sobre
  // ele. Sem pré-multiplicar, as arestas ficam com um halo escuro.
  outColor = vec4(paper * u_opacity, u_opacity);
}
`;
