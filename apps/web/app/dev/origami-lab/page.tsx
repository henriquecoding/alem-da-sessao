import type { Metadata } from "next";
import {
  DirectionPanel,
  directions,
} from "@/components/origami/lab/direction-panel";
import { LabThemeToggle } from "@/components/origami/lab/lab-theme-toggle";
import { ProofSheet } from "@/components/origami/lab/proof-sheet";
import { origamiModelList } from "@/components/origami/models";
import {
  OrigamiDefs,
  OrigamiFigure,
} from "@/components/origami/origami-figure";
import { paperFamilyList } from "@/components/origami/tokens/paper";
import { contrastReport, topologyReport } from "@/components/origami/report";

export const metadata: Metadata = {
  title: "Origami Lab · interno",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

const heroPaper = {
  sheet: "lilac",
  "half-fold": "lilac",
  boat: "apricot",
  box: "jade",
  crane: "mist",
  "suspended-sheet": "lilac",
} as const;

/**
 * O laboratório. Não é uma homepage alternativa: é o sítio onde as
 * alternativas se comparam antes de alguma delas tocar na homepage.
 *
 * Existe porque a única forma honesta de rejeitar uma direção é ver as três
 * lado a lado, no mesmo tamanho, nos dois temas, com o mesmo conteúdo. Uma
 * direção apresentada sozinha ganha sempre.
 */
/**
 * `?only=<palco>` e `?section=<bloco>` existem para captura.
 *
 * O contact sheet é um entregável, e um entregável não se produz a recortar
 * imagens à mão: pede-se a página que mostre exatamente um bloco, com a
 * largura certa, e captura-se. É também assim que se comparam duas direções
 * sem o resto da página a interferir na leitura.
 */
export default async function OrigamiLabPage({
  searchParams,
}: {
  searchParams: Promise<{ only?: string; section?: string; theme?: string }>;
}) {
  const { only, section, theme } = await searchParams;
  const shown = directions.filter((d) => !only || d.id === only);
  const show = (name: string) => !section || section === name;

  const contrast = contrastReport();
  const topology = topologyReport();
  const failures = contrast.filter((row) => !row.passes).length;
  const topologyFailures = topology.filter(
    (row) => row.problems.length > 0,
  ).length;

  return (
    <main className="mx-auto grid w-full max-w-[92rem] gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <OrigamiDefs />

      <header className="grid gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-foreground)]">
          Interno · fora do sitemap · não existe em produção
        </p>
        <h1 className="text-[clamp(2rem,1.4rem+2.4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
          Origami Lab — A Folha Entre Sessões
        </h1>
        <p className="max-w-[68ch] leading-7 text-[var(--muted-foreground)]">
          Três direções comparáveis, folhas de prova por objeto e o relatório
          que decide se alguma delas pode ser integrada. Nada aqui substitui a
          homepage; a homepage só muda depois de uma escolha humana.
        </p>
        <LabThemeToggle initialTheme={theme === "dark" ? "dark" : "light"} />
      </header>

      {show("audit") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            1 · Auditoria da direção anterior
          </h2>
          <ul className="grid max-w-[80ch] list-disc gap-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Topologia.</strong>{" "}
              Os três modelos anteriores (garça, raposa, barco) eram conjuntos
              de 8 a 10 polígonos independentes. Nenhuma aresta era partilhada
              entre faces vizinhas, portanto nenhum deles pertencia a uma folha.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Reconhecimento.
              </strong>{" "}
              Nenhuma das figuras sobrevivia à silhueta preta. A raposa lia-se
              como losango; a garça, como um conjunto de estilhaços.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Composição.</strong>{" "}
              Sete folhas de semana, dois portais laterais, três formas de
              ambiente e um objeto central pequeno: a hierarquia estava
              invertida.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Movimento.</strong>{" "}
              Três halos com animação permanente (<code>home-ambient</code>),
              sem causa e sem fim.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Estado.</strong>{" "}
              Quatro variáveis independentes (<code>mode</code>,{" "}
              <code>step</code>, <code>moment</code>, <code>crossing</code>)
              permitiam combinações que não existem no produto.
            </li>
          </ul>
        </section>
      ) : null}

      {show("heroes") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            2 · As três direções, lado a lado
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-[var(--muted-foreground)]">
            O mesmo objeto, a mesma luz, a mesma escala. Só muda o palco e a
            família de papel. Uma direção apresentada sozinha ganha sempre; é
            por isso que esta grelha existe.
          </p>
          <div className="grid gap-3 lg:grid-cols-3">
            {directions.map((direction) => (
              <div key={direction.id} className="grid gap-2">
                <p className="origami-proof-label">{direction.name}</p>
                {(["light", "dark"] as const).map((theme) => (
                  <div
                    key={theme}
                    className="origami-lab-theme origami-stage grid place-items-center rounded-xl p-6"
                    data-theme-preview={theme}
                    data-stage={direction.id}
                  >
                    <OrigamiFigure
                      model="crane"
                      paper={direction.hero}
                      style={{ width: "min(100%, 13rem)" }}
                    />
                  </div>
                ))}
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  {direction.thesis}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {show("directions") ? (
        <section className="grid gap-6">
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              2 · Três direções
            </h2>
            <p className="max-w-[68ch] text-sm leading-6 text-[var(--muted-foreground)]">
              Cada painel traz o mesmo conteúdo: objeto hero nos dois temas, a
              transição em três fotogramas, os quatro cartões de resultado, o
              recorte desktop e o recorte mobile a 390 px reais.
            </p>
          </div>
          {shown.map((direction) => (
            <DirectionPanel key={direction.id} direction={direction} />
          ))}
        </section>
      ) : null}

      {show("proofs") ? (
        <section className="grid gap-6">
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              3 · Folhas de prova por objeto
            </h2>
            <p className="max-w-[68ch] text-sm leading-6 text-[var(--muted-foreground)]">
              A silhueta vem primeiro. Se o objeto falha a preto sobre branco,
              nada do que vem a seguir o salva.
            </p>
          </div>
          {origamiModelList.map((model) => (
            <ProofSheet
              key={model.id}
              model={model.id}
              paper={heroPaper[model.id]}
              stage="atelier"
            />
          ))}
        </section>
      ) : null}

      {show("contact") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            4 · Contact sheet
          </h2>
          <p className="max-w-[68ch] text-sm leading-6 text-[var(--muted-foreground)]">
            Todas as combinações de objeto × família de papel × palco × tema, no
            mesmo tamanho. É aqui que uma família se revela fraca contra um
            palco específico.
          </p>
          {shown.map((direction) => (
            <div key={direction.id} className="grid gap-2">
              <p className="origami-proof-label">{direction.name}</p>
              {(["light", "dark"] as const).map((theme) => (
                <div
                  key={theme}
                  className="origami-lab-theme origami-stage grid gap-2 rounded-xl p-3"
                  data-theme-preview={theme}
                  data-stage={direction.id}
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(6rem, 1fr))",
                  }}
                >
                  {origamiModelList.flatMap((model) =>
                    paperFamilyList.map((family) => (
                      <OrigamiFigure
                        key={`${model.id}-${family.id}`}
                        model={model.id}
                        paper={family.id}
                        style={{ width: "96px" }}
                      />
                    )),
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {show("reports") ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            5 · Relatórios
          </h2>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[44rem] text-left text-xs">
              <caption className="p-3 text-left text-sm font-semibold">
                Topologia —{" "}
                {topologyFailures === 0 ? "sem falhas" : "com falhas"}
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-2">modelo</th>
                  <th className="p-2">faces</th>
                  <th className="p-2">área silhueta</th>
                  <th className="p-2">área das faces</th>
                  <th className="p-2">problemas</th>
                </tr>
              </thead>
              <tbody>
                {topology.map((row) => (
                  <tr
                    key={row.model}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="p-2 font-mono">{row.model}</td>
                    <td className="p-2">{row.faces}</td>
                    <td className="p-2">{row.silhouetteArea.toFixed(0)}</td>
                    <td className="p-2">{row.faceArea.toFixed(0)}</td>
                    <td className="p-2">
                      {row.problems.length === 0
                        ? "—"
                        : row.problems.join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[48rem] text-left text-xs">
              <caption className="p-3 text-left text-sm font-semibold">
                Contraste —{" "}
                {failures === 0 ? "24/24 passam" : `${failures} falham`}
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-2">palco</th>
                  <th className="p-2">família</th>
                  <th className="p-2">tema</th>
                  <th className="p-2">contorno/palco</th>
                  <th className="p-2">contorno/papel</th>
                  <th className="p-2">lit/shade</th>
                  <th className="p-2">papel/palco</th>
                  <th className="p-2">fronteira</th>
                </tr>
              </thead>
              <tbody>
                {contrast.map((row) => (
                  <tr
                    key={`${row.stage}-${row.family}-${row.theme}`}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="p-2 font-mono">{row.stage}</td>
                    <td className="p-2 font-mono">{row.family}</td>
                    <td className="p-2">{row.theme}</td>
                    <td className="p-2">{row.edgeVsStage.toFixed(2)}</td>
                    <td className="p-2">{row.edgeVsBase.toFixed(2)}</td>
                    <td className="p-2">{row.litVsShade.toFixed(2)}</td>
                    <td className="p-2">{row.baseVsStage.toFixed(2)}</td>
                    <td className="p-2">
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
