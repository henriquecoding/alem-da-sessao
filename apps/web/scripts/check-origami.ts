import { contrastReport, topologyReport } from "../components/origami/report";

/**
 * `check:origami` — a porta que o CI fecha.
 *
 * O relatório em si vive em `components/origami/report.ts`, porque a página do
 * laboratório mostra as mesmas tabelas. Aqui só se imprime e se decide o
 * código de saída: duas famílias de defeito, ambas invisíveis para o lint.
 *
 * **Topologia.** Um origami é uma folha. Se duas faces vizinhas não citarem o
 * mesmo vértice existe uma fenda, e uma fenda é a diferença entre papel
 * dobrado e polígonos encostados.
 *
 * **Contraste real, contra a cor adjacente real.** Não a média de um
 * gradiente, não o par que alguém se lembrou de escrever à mão: cada família
 * de papel contra cada palco, nos dois temas.
 */
function main() {
  let failed = false;

  console.log("check:origami — topologia dos modelos");
  for (const row of topologyReport()) {
    const status = row.problems.length ? "FALHA" : "ok";
    console.log(
      `  ${row.model.padEnd(16)} ${String(row.faces).padStart(2)} faces  área ${row.faceArea.toFixed(0)}  ${status}`,
    );
    for (const problem of row.problems) {
      console.error(`    ✗ ${problem}`);
      failed = true;
    }
  }

  console.log("\ncheck:origami — contraste papel/palco (WCAG 1.4.11)");
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
