import { describe, expect, it } from "vitest";
import { OrigamiTimeline } from "@/components/origami/use-origami-timeline";
import { parseCssColour } from "@/components/origami/runtime/colour";

/**
 * A linha de tempo e a cor — as duas partes do runtime que se testam sem GPU.
 *
 * O renderizador em si precisa de um contexto WebGL2 que o `jsdom` não tem, e
 * fingi-lo com um duplo não provaria nada sobre desenhar. O que se testa aqui é
 * o que decide *quando* desenhar e *com que cor*, que é onde vivem os defeitos
 * que ninguém vê numa captura: um loop que nunca para e uma gama errada.
 */

const CLIPS = [
  {
    id: "flat-to-noticed" as const,
    durationMs: 600,
    easing: "paper-in" as const,
    firstFrame: 0,
    lastFrame: 6,
    endState: "noticed" as const,
  },
  {
    id: "forming-to-formed" as const,
    durationMs: 800,
    easing: "paper-settle" as const,
    firstFrame: 6,
    lastFrame: 24,
    endState: "formed" as const,
  },
];

describe("linha de tempo", () => {
  it("começa parada", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    expect(timeline.rest.running).toBe(false);
    expect(timeline.rest.clipId).toBe(null);
  });

  it("interpola entre dois keyframes adjacentes", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    timeline.play("forming-to-formed", 0);

    const middle = timeline.sample(400);
    expect(middle.running).toBe(true);
    expect(middle.frameA).toBeGreaterThanOrEqual(6);
    expect(middle.frameB).toBeLessThanOrEqual(24);
    expect(middle.frameB - middle.frameA).toBeLessThanOrEqual(1);
    expect(middle.mix).toBeGreaterThanOrEqual(0);
    expect(middle.mix).toBeLessThan(1);
  });

  /**
   * O gate de «zero loop ocioso».
   *
   * `running` tem de ficar `false` no instante em que o clip acaba, e tem de
   * continuar `false` para sempre. Um `true` que voltasse aqui seria um
   * `requestAnimationFrame` a manter a GPU acordada numa página onde nada se
   * move.
   */
  it("para no fim e não volta a arrancar", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    timeline.play("forming-to-formed", 0);

    expect(timeline.sample(800).running).toBe(false);
    expect(timeline.sample(1600).running).toBe(false);
    expect(timeline.sample(100000).running).toBe(false);
  });

  it("acaba exatamente no frame aprovado", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    timeline.play("forming-to-formed", 0);

    const end = timeline.sample(900);
    expect(end.frameA).toBe(24);
    expect(end.frameB).toBe(24);
    expect(end.mix).toBe(0);
  });

  /**
   * Movimento reduzido não é a animação desligada: é a mesma informação sem
   * deslocação. Quem pediu menos movimento continua a ver o objeto formado, e
   * vê-o imediatamente.
   */
  it("com movimento reduzido salta ao estado final sem animar", () => {
    const timeline = new OrigamiTimeline(CLIPS, true);
    const snapshot = timeline.play("forming-to-formed", 0);

    expect(snapshot.running).toBe(false);
    expect(snapshot.frameA).toBe(24);
    expect(snapshot.frameB).toBe(24);
    expect(snapshot.clipId).toBe("forming-to-formed");
  });

  it("reencaminha para o frame final sem animar quando se repõe o estado", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    const snapshot = timeline.settleAt("flat-to-noticed");
    expect(snapshot.frameA).toBe(6);
    expect(snapshot.running).toBe(false);
  });

  it("atira quando lhe pedem um clip que o modelo não tem", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    expect(() => timeline.play("noticed-to-forming" as never, 0)).toThrow(
      /clip inexistente/,
    );
  });

  it("nunca sai do intervalo do clip, mesmo com relógio a andar para trás", () => {
    const timeline = new OrigamiTimeline(CLIPS, false);
    timeline.play("forming-to-formed", 1000);

    const early = timeline.sample(500);
    expect(early.frameA).toBeGreaterThanOrEqual(6);
    expect(early.frameB).toBeLessThanOrEqual(24);
  });
});

describe("leitura de cor", () => {
  /**
   * Sem a conversão para linear, multiplicar por um termo de Lambert escurece
   * de mais no meio da rampa — o defeito que faz papel parecer cartolina
   * fotocopiada.
   */
  it("converte sRGB para linear", () => {
    const white = parseCssColour("rgb(255, 255, 255)");
    expect(white?.[0]).toBeCloseTo(1, 6);

    const mid = parseCssColour("rgb(128, 128, 128)");
    // 50% em sRGB é ~21,6% de luz. Se isto desse 0,5, a conversão não aconteceu.
    expect(mid?.[0]).toBeCloseTo(0.2158, 3);
  });

  it("aceita as formas que os navegadores devolvem", () => {
    expect(parseCssColour("rgb(233 213 200)")).not.toBeNull();
    expect(parseCssColour("rgb(233, 213, 200)")).not.toBeNull();
    expect(parseCssColour("color(srgb 0.91 0.83 0.78)")).not.toBeNull();
  });

  it("devolve null em vez de uma cor inventada", () => {
    expect(parseCssColour("")).toBeNull();
    expect(parseCssColour("   ")).toBeNull();
    expect(parseCssColour("transparent")).toBeNull();
  });

  it("lê `color(srgb …)` na mesma escala que `rgb(…)`", () => {
    const viaBytes = parseCssColour("rgb(255, 0, 0)");
    const viaFloat = parseCssColour("color(srgb 1 0 0)");
    expect(viaFloat?.[0]).toBeCloseTo(viaBytes?.[0] ?? -1, 6);
  });
});
