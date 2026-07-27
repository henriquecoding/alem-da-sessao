import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `cn` sabe que as superfícies são exclusivas entre si.
 *
 * Sem isto, `cn("surface-raised", "surface-primary")` devolvia as duas classes
 * e ganhava a que estivesse escrita depois na folha de estilos — não a que o
 * autor passou. Foi assim que um cartão pedido a verde ficou cinzento
 * **enquanto herdava o texto do verde**: fundo de uma superfície, texto de
 * outra. Não há pior combinação possível, e era exatamente o que se via no
 * ecrã.
 *
 * O `tailwind-merge` já faz esta desduplicação para `bg-*` e `text-*`. Uma
 * superfície é a mesma categoria de decisão — em que material o elemento
 * assenta — e por isso entra no mesmo mecanismo, em vez de ter uma regra à
 * parte que alguém tem de conhecer para não a partir.
 */
const surfaces = [
  "page",
  "raised",
  "sunken",
  "muted",
  "private",
  "shared-soft",
  "retained",
  "success",
  "warning",
  "info",
  "danger",
  "primary",
  "accent",
  "shared",
  "destructive",
  "sidebar",
  "sidebar-raised",
  "sidebar-raised-strong",
  "ink",
  "ink-raised",
  // Os pigmentos. Faltarem aqui não dava erro nenhum: dava um cartão que
  // ignorava em silêncio a superfície que lhe foi passada, porque o `bg-*` do
  // componente não era removido e a utilidade ganha à camada de componentes.
  "pigment-sage",
  "pigment-clay",
  "pigment-sand",
  "pigment-stone",
  "pigment-ochre",
  "pigment-rose",
  "pigment-sky",
  "pigment-plum",
] as const;

// O parâmetro de tipo regista o grupo novo; sem ele o TypeScript só aceita
// os grupos que o tailwind-merge já conhece.
const twMerge = extendTailwindMerge<"surface">({
  extend: {
    classGroups: {
      surface: [{ surface: [...surfaces] }],
    },
    // Uma superfície escrita depois substitui um fundo, uma cor de texto ou
    // uma linha escritos antes — porque as três coisas passam a vir dela.
    conflictingClassGroups: {
      surface: ["bg-color", "text-color", "border-color"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
