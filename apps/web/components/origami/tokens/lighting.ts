/**
 * Uma única luz para todos os objetos.
 *
 * O sintoma mais visível da versão anterior era este: cada peça tinha o seu
 * próprio gradiente e a sua própria sombra, portanto cada peça vivia numa cena
 * diferente. O resultado lê-se como colagem mesmo quando cada peça, isolada,
 * está bem desenhada.
 *
 * Estes valores não são decorativos — são o contrato que as quatro categorias
 * tonais de `paper.ts` implementam. Se algum modelo precisar de uma luz
 * diferente para «ficar bem», o modelo está errado, não a luz.
 */

/** Origem superior esquerda, em graus a partir do eixo x positivo do ecrã. */
export const lightAngleDegrees = 214;

/** Distância da sombra projetada, em unidades de `viewBox`. */
export const shadowOffset = { x: 10, y: 8 } as const;

/** Opacidade da sombra de contacto. Baixa: papel não é vidro. */
export const shadowOpacity = { light: 0.16, dark: 0.4 } as const;

/**
 * Que tom recebe cada orientação de face. Existe para ser lido por quem
 * desenhar o próximo modelo: a atribuição de tons não é gosto, é geometria.
 */
export const toneByOrientation = {
  /** Virada à luz, para cima e para a esquerda. */
  "up-left": "lit",
  /** Frontal ou quase. A cor da família. */
  front: "base",
  /** Afastada da luz, para baixo e para a direita. */
  "down-right": "shade",
  /** Avesso do papel, interior de uma caixa, face ocluída. */
  reverse: "inner",
} as const;
