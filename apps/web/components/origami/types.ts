import type {
  OrigamiModelId,
  OrigamiResultId,
} from "@alem-da-sessao/origami-core";

/**
 * Os identificadores dos modelos, do lado do produto.
 *
 * Não há aqui geometria nenhuma, e é essa a diferença em relação ao ficheiro
 * que este substituiu. A versão anterior declarava vértices, faces e tons por
 * face — uma folha desenhada. A forma vive agora em `source.fold`, e o que
 * atravessa a aplicação é só o nome do modelo.
 *
 * O `import type` é erasado na compilação: nenhum byte do pacote de autoria
 * chega ao browser, e `check:origami-runtime` verifica-o.
 */
export type { OrigamiModelId, OrigamiResultId };

/**
 * Os quatro objetos que uma decisão pode produzir.
 *
 * `envelope` e `gate` substituíram `boat` e `crane`. Os dois tradicionais
 * fazem-se por sequência, com dobras que reordenam camadas, e este motor não
 * tem modelo de camadas — o motivo está em `docs/ORIGAMI_RUNTIME.md` §5.
 *
 * A troca não foi uma cedência: «levar algo adiante» é, na plataforma, uma nota
 * que chega à próxima sessão porque alguém a partilhou, e isso é uma carta
 * fechada. «Atravessar para uma experiência» é passar para o outro lado de
 * alguma coisa, e isso é uma passagem. As formas passaram a nomear as decisões
 * com mais precisão do que nomeavam antes.
 */
export const origamiResultIds: readonly OrigamiResultId[] = [
  "envelope",
  "box",
  "gate",
  "suspended-sheet",
];

/** Todos os modelos, incluindo os dois que são estado e não resultado. */
export const origamiModelIds: readonly OrigamiModelId[] = [
  "sheet",
  "half-fold",
  "envelope",
  "box",
  "gate",
  "suspended-sheet",
];
