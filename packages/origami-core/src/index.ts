/**
 * `@alem-da-sessao/origami-core` — o lado de autoria do sistema.
 *
 * **Este pacote não pode ser importado pelo browser.** É verificado por
 * `check:origami-boundary` e não por convenção: traz o validador, o
 * triangulador e o solver, que juntos pesam mais do que a experiência inteira e
 * não servem para nada em produção. O que o browser carrega é o ficheiro
 * `.ors.json` que sai daqui.
 */

export * from "./fold-types";
export * from "./geometry";
export * from "./topology";
export * from "./authoring";
export * from "./validate";
export * from "./metrics";
export * from "./solver";
export * from "./bake";
export * from "./compile";
export * from "./quantize";
