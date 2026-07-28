import type { MetadataRoute } from "next";
import { publicLaunchIsEnabled } from "@/lib/runtime";

const publicRoutes = [
  "",
  "/experiencias",
  "/diretorio",
  "/precos",
  "/seguranca",
  "/privacidade",
  "/termos",
  "/acessibilidade",
  "/subprocessadores",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicLaunchIsEnabled()) return [];

  return (["pt-pt", "pt-br"] as const).flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: `https://alemdasessao.com/${locale}${route}`,
      changeFrequency:
        route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/experiencias" ? 0.8 : 0.6,
      alternates: {
        languages: {
          "pt-PT": `https://alemdasessao.com/pt-pt${route}`,
          "pt-BR": `https://alemdasessao.com/pt-br${route}`,
        },
      },
    })),
  );
}
