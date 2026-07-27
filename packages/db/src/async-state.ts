/**
 * Estados honestos — relatório v2 §7.5.
 *
 * Um estado discriminado força cada superfície a decidir o que mostrar em vez
 * de colapsar tudo em "carregar ou vazio". Os dois acrescentos do relatório
 * são os que carregam o modelo de privacidade:
 *
 * - `withheld` é o estado mais importante do lado profissional: *"existe algo
 *   aqui, e não é seu para ver."* É diferente de vazio e diferente de
 *   proibido, e comunicá-lo bem é o que torna o modelo compreensível em vez
 *   de abstrato.
 * - `expired` distingue um snapshot que caducou de um que nunca existiu.
 *
 * Atenção ao invariante do §10.6.5: para o profissional, um intervalo **sem**
 * artefactos e um intervalo cujos artefactos **não foram partilhados** têm de
 * ser indistinguíveis. Por isso `withheld` nunca é usado para conteúdo de
 * cliente não partilhado — nesse caso a superfície profissional recebe
 * `empty`. `withheld` existe para o que o cliente já mostrou que existe (uma
 * partilha revogada, por exemplo), nunca para revelar a existência de um
 * rascunho privado.
 */
export type WithheldReason = "not_shared" | "revoked" | "retained";

export type AsyncState<T> =
  | { kind: "loading" }
  | { kind: "ready"; data: T; freshness: "fresh" | "stale" }
  | { kind: "empty" }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "offline"; cached?: T }
  | { kind: "error"; retryable: boolean; referenceId: string }
  | { kind: "withheld"; reason: WithheldReason }
  | { kind: "expired"; expiredAt: Date };

export type AsyncStateKind = AsyncState<unknown>["kind"];

export const asyncStateKinds: readonly AsyncStateKind[] = [
  "loading",
  "ready",
  "empty",
  "unauthenticated",
  "forbidden",
  "offline",
  "error",
  "withheld",
  "expired",
] as const;

export function isReady<T>(
  state: AsyncState<T>,
): state is { kind: "ready"; data: T; freshness: "fresh" | "stale" } {
  return state.kind === "ready";
}

/**
 * Gera a referência curta que aparece na mensagem de erro. É deliberadamente
 * legível ao telefone: alguém em sofrimento não vai ditar um UUID.
 */
export function errorReference(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
}
