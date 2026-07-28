import type { Metadata } from "next";
import { LabThemeToggle } from "@/components/origami/lab/lab-theme-toggle";
import { RuntimePanel } from "@/components/origami/lab/runtime-panel";
import { contrastReport } from "@/components/origami/report";

export const metadata: Metadata = {
  title: "Origami Lab · interno",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

/**
 * O laboratório. Não é uma homepage alternativa: é onde se verifica que os
 * objetos da homepage vêm mesmo de uma folha.
 *
 * A versão anterior desta página comparava três direções de arte com figuras
 * SVG desenhadas à mão. Essa comparação já foi feita — a direção «Ateliê de
 * luz» foi escolhida — e as figuras foram apagadas. O que resta é a pergunta
 * que nenhuma delas conseguia responder: *isto dobra?*
 *
 * Para cada modelo mostra a cadeia inteira: o padrão de vincos lido do
 * `source.fold`, o objeto que sai dele, e as medições que o deixaram passar.
 * Quem olha para os três em conjunto verifica sem confiar em nenhuma afirmação.
 *
 * `?section=<bloco>` existe para captura: pede-se a página que mostre um bloco
 * só, com a largura certa.
 */
export default async function OrigamiLabPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; theme?: string }>;
}) {
  const { section, theme } = await searchParams;
  const show = (name: string) => !section || section === name;

  const contrast = contrastReport();
  const failures = contrast.filter((row) => !row.passes).length;

  return (
    <main className="mx-auto grid w-full max-w-[92rem] gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <header className="grid gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
          Interno · fora do sitemap · não existe em produção
        </p>
        <h1 className="text-[clamp(2rem,1.4rem+2.4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          Origami Lab — a folha e o que sai dela
        </h1>
        <p className="max-w-[68ch] leading-7 text-[var(--muted-foreground)]">
          Seis modelos, cada um dobrado a partir de uma folha quadrada íntegra
          por um solver bar-and-hinge. Nada aqui é desenhado: o que se vê é o
          frame final de uma simulação que passou os gates.
        </p>
        <LabThemeToggle initialTheme={theme === "dark" ? "dark" : "light"} />
      </header>

      {show("runtime") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            1 · Do padrão de vincos ao objeto
          </h2>
          <p className="max-w-[72ch] text-sm leading-6 text-[var(--muted-foreground)]">
            À esquerda a folha com os montes e os vales onde o autor os pôs; ao
            centro o objeto que sai deles, com o mesmo asset que a homepage
            carrega; à direita as medições. Se o desenho e o objeto discordarem,
            um dos dois está errado — e é para isso que estão lado a lado.
          </p>
          <RuntimePanel />
        </section>
      ) : null}

      {show("contrast") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            2 · Contraste do papel contra o palco
          </h2>
          <p className="max-w-[72ch] text-sm leading-6 text-[var(--muted-foreground)]">
            Cada família de papel contra cada palco, nos dois temas, medida
            contra a cor adjacente real e não contra a média de um gradiente.
            Quem carrega a fronteira muda com o tema: no claro é o contorno, no
            escuro é o preenchimento. Uma das duas vias tem de passar.
          </p>
          <p className="font-mono text-xs text-[var(--muted-foreground)]">
            {failures === 0
              ? `${contrast.length} combinações, todas dentro dos limites.`
              : `${failures} de ${contrast.length} combinações falham.`}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse font-mono text-xs">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-normal">palco</th>
                  <th className="py-2 pr-4 font-normal">família</th>
                  <th className="py-2 pr-4 font-normal">tema</th>
                  <th className="py-2 pr-4 text-right font-normal">
                    contorno/palco
                  </th>
                  <th className="py-2 pr-4 text-right font-normal">
                    contorno/papel
                  </th>
                  <th className="py-2 pr-4 text-right font-normal">
                    luz/sombra
                  </th>
                  <th className="py-2 pr-4 text-right font-normal">
                    papel/palco
                  </th>
                  <th className="py-2 pr-4 font-normal">fronteira</th>
                </tr>
              </thead>
              <tbody>
                {contrast.map((row) => (
                  <tr
                    key={`${row.stage}-${row.family}-${row.theme}`}
                    className="border-t border-[var(--border)]"
                    data-passes={row.passes ? "true" : "false"}
                  >
                    <td className="py-1.5 pr-4">{row.stage}</td>
                    <td className="py-1.5 pr-4">{row.family}</td>
                    <td className="py-1.5 pr-4">{row.theme}</td>
                    <td className="py-1.5 pr-4 text-right">
                      {row.edgeVsStage.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-4 text-right">
                      {row.edgeVsBase.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-4 text-right">
                      {row.litVsShade.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-4 text-right">
                      {row.baseVsStage.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-4">
                      {row.boundary}
                      {row.passes ? "" : " ✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
