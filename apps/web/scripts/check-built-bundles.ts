import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import { toolRegistry } from "@alem-da-sessao/tool-registry";

type RouteStat = {
  route: string;
  firstLoadChunkPaths: string[];
};

async function gzipKilobytes(paths: string[]) {
  let bytes = 0;
  for (const path of new Set(paths)) {
    const source = await readFile(path);
    bytes += gzipSync(source, { level: 9 }).byteLength;
  }
  return Math.round((bytes / 1024) * 10) / 10;
}

async function main() {
  const statsPath = ".next/diagnostics/route-bundle-stats.json";
  try {
    await stat(statsPath);
  } catch {
    throw new Error(
      "check:built-bundles precisa de um build acabado. Execute pnpm build primeiro.",
    );
  }

  const routes = JSON.parse(await readFile(statsPath, "utf8")) as RouteStat[];
  const localizedRoutes = routes.filter((route) =>
    route.route.startsWith("/[locale]"),
  );
  const failures: string[] = [];
  const careRoute = /^\/\[locale\]\/(?:pro|admin|cuidado\/(?!experiencias))/;
  const sharedByEveryRoute = localizedRoutes
    .map((route) => new Set(route.firstLoadChunkPaths))
    .reduce((shared, routeChunks) => {
      return new Set([...shared].filter((chunk) => routeChunks.has(chunk)));
    });
  const frameworkKb = await gzipKilobytes([...sharedByEveryRoute]);
  const frameworkBudgetKb = 165;

  console.log(
    `  base Next + locale: ${frameworkKb} kB gzip / ${frameworkBudgetKb} kB`,
  );
  if (frameworkKb > frameworkBudgetKb) {
    failures.push(
      `base Next + locale: ${frameworkKb} kB excede ${frameworkBudgetKb} kB gzip.`,
    );
  }

  for (const route of localizedRoutes) {
    // A base React/Next e o layout localizado são transferidos e guardados em
    // cache uma vez. Somá-los a cada rota tornava um limite de 75 kB impossível
    // mesmo para uma página vazia. Medimos a base separadamente e, por rota,
    // apenas o custo incremental que a navegação acrescenta.
    const routeOnlyChunks = route.firstLoadChunkPaths.filter(
      (chunk) => !sharedByEveryRoute.has(chunk),
    );
    const kb = await gzipKilobytes(routeOnlyChunks);
    let budget = 90;

    if (careRoute.test(route.route)) budget = 75;
    if (route.route.includes("estruturas-de-carga")) {
      budget =
        toolRegistry.find((tool) => tool.slug === "estruturas-de-carga")
          ?.originality.visualDirection.bundleBudgetKb ?? 125;
    }
    if (route.route.includes("inventario-da-sessao")) {
      budget =
        toolRegistry.find((tool) => tool.slug === "inventario-da-sessao")
          ?.originality.visualDirection.bundleBudgetKb ?? 70;
    }

    console.log(`  ${route.route}: ${kb} kB gzip incrementais / ${budget} kB`);
    if (kb > budget) {
      failures.push(
        `${route.route}: ${kb} kB incrementais excede ${budget} kB gzip.`,
      );
    }
  }

  if (failures.length) {
    console.error("check:built-bundles — orçamento real excedido:");
    failures.forEach((failure) => console.error(`  ${failure}`));
    process.exitCode = 1;
  } else {
    console.log(
      `check:built-bundles passou para ${localizedRoutes.length} rotas localizadas.`,
    );
  }
}

void main();
