import { getMessages } from "@alem-da-sessao/i18n";
import { HomeExperience } from "@/components/homepage/home-experience";
import { OrigamiFigure } from "@/components/origami/origami-figure";
import type { PaperFamilyId, StageId } from "@/components/origami/tokens/paper";
import { stageSurfaces } from "@/components/origami/tokens/paper";
import { origamiResultIds } from "@/components/origami/models";
import { origamiModels } from "@/components/origami/models";

export type Direction = {
  id: StageId;
  name: string;
  thesis: string;
  hero: PaperFamilyId;
  light: string;
  material: string;
  performance: string;
  risk: string;
};

/**
 * As três direções variam em linguagem e não só em cor.
 *
 * A tentação óbvia era produzir a mesma cena três vezes com paletas
 * diferentes, e isso não é uma escolha de direção — é uma escolha de
 * preenchimento. Aqui muda o palco, muda a relação do objeto com o plano em
 * que assenta, e muda o que a cena está a dizer sobre onde a pessoa está.
 */
export const directions: readonly Direction[] = [
  {
    id: "atelier",
    name: "Ateliê de luz",
    thesis:
      "O papel está pousado numa superfície real. Há uma mesa, há uma luz que entra pela esquerda e há sombra de contacto. A cena diz: isto é um objeto, e alguém está a trabalhá-lo.",
    hero: "apricot",
    light:
      "Uma só luz, superior esquerda, com o plano da mesa a escurecer para o lado oposto. O gradiente de ambiente e as sombras dos objetos vêm da mesma direção — é isso que impede a leitura de colagem.",
    material:
      "Papel quente, fibra visível a 320 px e impercetível a 96 px. A sombra de contacto é curta e a projetada é larga e fraca.",
    performance:
      "Um gradiente linear estático no palco. Nenhum filtro, nenhuma imagem. Custo idêntico ao das outras duas.",
    risk: "É a mais próxima do território «ilustração de produtividade» se a paleta aquecer demais. Exige disciplina no âmbar.",
  },
  {
    id: "field",
    name: "Campo suspenso",
    thesis:
      "Não há mesa. O objeto ocupa um espaço abstrato com muita área negativa e uma zona tonal que o segura. A cena diz: isto ainda não pousou em lado nenhum.",
    hero: "mist",
    light:
      "A mesma direção de luz, mas sem plano de apoio: a sombra afasta-se do objeto e fica mais difusa, o que é o que acontece a um corpo suspenso.",
    material:
      "Papel frio, contraste tonal um pouco mais alto para compensar a ausência de superfície de referência.",
    performance:
      "Um gradiente radial estático. É a direção com menos pintura das três.",
    risk: "A área negativa é a sua força e o seu risco: em ecrãs pequenos sobra fundo e o objeto parece pequeno demais. Obriga a uma escala mínima maior no telemóvel.",
  },
  {
    id: "notebook",
    name: "Caderno arquitetónico",
    thesis:
      "O papel está sobre um plano com pauta e margem. A cena diz: isto é trabalho, é registo, é uma decisão a ser tomada — e não uma atmosfera contemplativa.",
    hero: "jade",
    light:
      "Luz mais plana e mais frontal. O volume vem quase todo dos vincos e da oclusão, e menos da rampa tonal.",
    material:
      "Material mais gráfico do que cenográfico: menos fibra, arestas mais definidas, sombras mais curtas.",
    performance:
      "Duas camadas de gradiente repetido no palco, estáticas. Ligeiramente mais cara do que as outras duas, e ainda assim sem filtros.",
    risk: "É a que mais depende de linhas finas, e linhas finas são as primeiras a desaparecer com antialiasing. A pauta nunca passa por baixo de texto.",
  },
];

export function DirectionPanel({ direction }: { direction: Direction }) {
  const copy = getMessages("pt-PT").home;
  const surface = stageSurfaces[direction.id];

  return (
    <article className="grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <header className="grid gap-2">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          {direction.name}
        </h3>
        <p className="max-w-[60ch] text-sm leading-6 text-[var(--muted-foreground)]">
          {direction.thesis}
        </p>
        <dl className="grid gap-2 text-xs leading-5 text-[var(--muted-foreground)] sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--foreground)]">Luz</dt>
            <dd>{direction.light}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--foreground)]">Material</dt>
            <dd>{direction.material}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--foreground)]">
              Performance
            </dt>
            <dd>{direction.performance}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--foreground)]">Risco</dt>
            <dd>{direction.risk}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--foreground)]">Palco</dt>
            <dd>
              {surface.role} · claro {surface.light} · escuro {surface.dark}
            </dd>
          </div>
        </dl>
      </header>

      {/* Objeto hero, nos dois temas, no palco da própria direção. */}
      <div className="grid gap-3 sm:grid-cols-2">
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
              style={{ width: "min(100%, 15rem)" }}
            />
          </div>
        ))}
      </div>

      {/* A transição, em três fotogramas: folha, meia dobra, objeto. Uma
          animação não se avalia por captura — o que se avalia aqui é se os
          três estados são a mesma folha. */}
      <div>
        <p className="origami-proof-label mb-2">
          transição · folha → meia dobra → objeto
        </p>
        <div
          className="origami-stage flex items-end justify-around gap-3 rounded-xl p-4"
          data-stage={direction.id}
        >
          {(["sheet", "half-fold", "boat"] as const).map((model) => (
            <OrigamiFigure
              key={model}
              model={model}
              paper={model === "boat" ? "apricot" : "lilac"}
              style={{ width: "9rem" }}
            />
          ))}
        </div>
      </div>

      {/* Cartão de resultado. */}
      <div>
        <p className="origami-proof-label mb-2">cartão de resultado</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {origamiResultIds.map((id) => (
            <div
              key={id}
              className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-3"
            >
              <div
                className="origami-stage origami-lab-chip rounded-lg"
                data-stage={direction.id}
                style={{ width: "4.5rem", height: "3.75rem" }}
              >
                <OrigamiFigure
                  model={id}
                  paper={
                    id === "boat"
                      ? "apricot"
                      : id === "box"
                        ? "jade"
                        : id === "crane"
                          ? "mist"
                          : "lilac"
                  }
                  showTexture={false}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {copy.result.objects[id].name}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {origamiModels[id].accessibleLabel["pt-PT"]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recorte desktop e recorte mobile. O mobile é um viewport de 390 px a
          sério, com a mesma folha de estilo — não uma coluna estreita. */}
      <div className="grid gap-4">
        <div>
          <p className="origami-proof-label mb-2">recorte desktop</p>
          <HomeExperience
            copy={copy}
            locale="pt-PT"
            segment="pt-pt"
            stage={direction.id}
          />
        </div>
        <div>
          <p className="origami-proof-label mb-2">recorte mobile · 390 px</p>
          <div className="origami-lab-viewport" data-viewport="mobile">
            <HomeExperience
              copy={copy}
              locale="pt-PT"
              segment="pt-pt"
              stage={direction.id}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
