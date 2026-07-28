import { contrastReport } from "../components/origami/report";

/**
 * `check:origami` — a porta que o CI fecha.
 *
 * O relatório em si vive em `components/origami/report.ts`, porque a página do
 * laboratório mostra as mesmas tabelas. Aqui só se imprime e se decide o
 * código de saída: duas famílias de defeito, ambas invisíveis para o lint.
 *
 * A topologia mudou de gate: era verificada aqui, sobre polígonos desenhados, e
 * passou para `check:origami-runtime`, que a verifica sobre a folha. Um desenho
 * podia ser topologicamente correto sem vir de folha nenhuma.
 *
 * Fica o **contraste real, contra a cor adjacente real.** Não a média de um
 * gradiente, não o par que alguém se lembrou de escrever à mão: cada família
 * de papel contra cada palco, nos dois temas.
 */
function main() {
  let failed = false;

  console.log("check:origami — contraste papel/palco (WCAG 1.4.11)");
  console.log(
    "  palco     família  tema   edge/palco  edge/papel  lit/shade  base/palco  fronteira",
  );
  for (const row of contrastReport()) {
    const line = [
      `  ${row.stage.padEnd(9)}`,
      row.family.padEnd(8),
      row.theme.padEnd(6),
      row.edgeVsStage.toFixed(2).padStart(10),
      row.edgeVsBase.toFixed(2).padStart(12),
      row.litVsShade.toFixed(2).padStart(11),
      row.baseVsStage.toFixed(2).padStart(12),
      `  ${row.boundary}`,
    ].join(" ");
    console.log(`${line}${row.passes ? "" : "   ✗"}`);
    if (!row.passes) failed = true;
  }

  if (failed) {
    console.error(
      "\ncheck:origami falhou. Nenhuma direção pode ser integrada com estes valores.",
    );
    process.exitCode = 1;
  } else {
    console.log("\ncheck:origami passou.");
  }
}

main();
