/**
 * A cor como informação, não como decoração.
 *
 * Uma agenda toda cinzenta é monótona, mas pintá-la ao acaso seria pior:
 * ruído a fingir de sinal. A saída é a mesma que o produto já usa para os
 * artefactos (§4.1) — **derivar a cor do conteúdo, de forma determinística**.
 *
 * A mesma pessoa recebe sempre o mesmo pigmento, em todos os ecrãs e em todas
 * as sessões. Ao fim de uma semana já não se lê o nome para saber quem é a das
 * onze: reconhece-se pela cor. Isso é uma ajuda real de leitura, e é a razão
 * pela qual isto não é maquilhagem.
 *
 * Três regras que o mantêm honesto:
 *
 * 1. **Determinístico.** FNV-1a sobre a chave, como em `stableHash`. Sem
 *    `Math.random`, sem `Date.now`: o mesmo servidor e o mesmo browser
 *    produzem a mesma cor, portanto não há divergência de hidratação nem
 *    surpresa entre recarregamentos.
 * 2. **Nunca sozinha.** WCAG 1.4.1: a cor não pode ser o único portador de
 *    significado. Todos os sítios onde isto é usado continuam a mostrar o nome
 *    e a modalidade por escrito — a cor só acelera o reconhecimento de uma
 *    coisa que já está lá escrita.
 * 3. **Não é semântica.** O pigmento não quer dizer «urgente» nem «bom» nem
 *    «em risco». Um estado com significado tem o seu token próprio
 *    (`--state-*`, `--private`, `--shared`) e nunca passa por aqui.
 */

const pigments = [
  "sage",
  "clay",
  "sand",
  "stone",
  "ochre",
  "rose",
  "sky",
  "plum",
] as const;

/**
 * `stone` é o pigmento neutro — existe para quando *não* se quer cor, como um
 * cartão de métrica que não deve competir com os do lado. Atribuí-lo a uma
 * pessoa dava-lhe um cartão cinzento no meio de cartões coloridos, e isso
 * lê-se como «este importa menos». Fica fora do sorteio.
 */
const assignable = pigments.filter((p) => p !== "stone");

export type Pigment = (typeof pigments)[number];

/** FNV-1a de 32 bits. O mesmo do artefacto, pela mesma razão. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** O pigmento de uma chave — um nome de cliente, um id, um rótulo. */
export function pigmentFor(key: string): Pigment {
  return assignable[hash(key) % assignable.length]!;
}

/**
 * A classe de superfície correspondente.
 *
 * Devolve a classe e não a cor de propósito: a superfície traz o fundo, a
 * linha e as cores de texto verificadas (ADR-033). Devolver um hexadecimal
 * seria reabrir exatamente a porta que essa engine fechou.
 */
export function pigmentSurface(key: string): string {
  return `surface-pigment-${pigmentFor(key)}`;
}

export const allPigments = pigments;
