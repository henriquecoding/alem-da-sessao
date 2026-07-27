import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

/**
 * `check:privacy` — relatório v2 §10.5, incluindo as três regras do funil
 * público do §8.2.
 *
 * A seção mais importante do relatório: com a porta A aberta, o produto passou
 * a ter exatamente a estrutura pela qual a FTC multou o BetterHelp em US$ 7,8M
 * — partilhar respostas de um questionário de saúde com plataformas de
 * publicidade.
 *
 * > No momento em que as experiências públicas viram funil de aquisição, tudo
 * > o que a pessoa escreve nelas passa a ser dado de saúde recolhido com
 * > finalidade comercial.
 *
 * Por isso F1/F2/F3 são arquitetura verificada, não política escrita.
 */

const roots = ["app", "components", "lib"];

/** Rotas onde alguém escreve sobre a própria vida. */
const experienceRoutes = [
  "app/[locale]/(public)/experiencias",
  "app/[locale]/(client)/cuidado/experiencias",
  "components/load-structures-experience.tsx",
  "components/load-structures-community.tsx",
  "components/session-inventory-experience.tsx",
  "components/experience-runtime",
];

const forbidden = [
  {
    pattern: /\blocalStorage\b/,
    reason: "rascunhos íntimos não podem usar localStorage (ADR-004)",
  },
  {
    pattern: /\bsessionStorage\b/,
    reason: "rascunhos íntimos não podem usar sessionStorage (ADR-004)",
  },
  {
    pattern: /\bindexedDB\b/,
    reason: "rascunhos íntimos não podem usar IndexedDB (ADR-004)",
  },
  { pattern: /session[-_ ]?replay/i, reason: "session replay é proibido" },
  {
    pattern: /NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE/,
    reason: "chaves privilegiadas não podem ser públicas",
  },
];

/**
 * F1 — zero tags de terceiros em qualquer rota de experiência. Meta, Google
 * Ads, TikTok, nenhum. Nunca.
 */
const thirdPartyTags = [
  {
    pattern: /connect\.facebook\.net|fbq\s*\(|facebook-jssdk/i,
    name: "Meta Pixel",
  },
  {
    pattern: /googletagmanager\.com|gtag\s*\(|dataLayer\.push/i,
    name: "Google Tag Manager / gtag",
  },
  {
    pattern: /google-analytics\.com|\bga\s*\(\s*['"]/i,
    name: "Google Analytics",
  },
  { pattern: /analytics\.tiktok\.com|ttq\./i, name: "TikTok Pixel" },
  {
    pattern: /snap\.licdn\.com|_linkedin_partner_id/i,
    name: "LinkedIn Insight",
  },
  { pattern: /sc-static\.net|snaptr\s*\(/i, name: "Snap Pixel" },
  { pattern: /static\.ads-twitter\.com|twq\s*\(/i, name: "X/Twitter Pixel" },
  { pattern: /doubleclick\.net|googlesyndication/i, name: "DoubleClick" },
  {
    pattern: /hotjar|clarity\.ms|fullstory|logrocket|smartlook/i,
    name: "gravador de sessão",
  },
];

/**
 * F2 — conteúdo de experiência nunca alimenta targeting, remarketing,
 * lookalike ou recomendação; e nenhum pacote de conteúdo importa cliente de
 * LLM (§4.7: a IA nunca lê o que a pessoa escreve).
 */
const forbiddenClients = [
  {
    pattern:
      /from\s+["'](?:openai|@anthropic-ai\/|@google\/gener|cohere-ai|@mistralai|replicate|langchain)/,
    name: "cliente de LLM",
  },
  {
    pattern:
      /from\s+["'](?:@segment|mixpanel|amplitude|posthog|@vercel\/analytics|react-ga)/,
    name: "cliente de analytics de produto",
  },
  {
    pattern:
      /\b(?:remarketing|lookalike|retargeting|audience_?id|conversion_?api)\b/i,
    name: "primitiva de targeting",
  },
];

/**
 * F3 — o encontro com o profissional acontece por filtros declarados e
 * verificáveis, nunca pelo que a pessoa escreveu. O motor de busca do
 * diretório não pode receber input derivado de conteúdo de experiência.
 */
const directorySurfaces = [
  "app/[locale]/(public)/diretorio",
  "components/directory.tsx",
  "lib/directory",
];

const contentDerivedInputs = [
  /toolRun/i,
  /\bloads\b/,
  /\bfragments\b/,
  /sessionBridge/i,
  /\bartifact(?:Input|Payload)\b/,
];

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(child)));
    } else if ([".ts", ".tsx", ".js", ".mjs"].includes(extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

async function collect(target: string): Promise<string[]> {
  try {
    return await filesUnder(target);
  } catch {
    try {
      await readFile(target, "utf8");
      return [target];
    } catch {
      return [];
    }
  }
}

async function main() {
  const failures: string[] = [];
  const show = (file: string) => relative(".", file).replace(/\\/g, "/");

  // Regras base, em toda a aplicação.
  for (const root of roots) {
    for (const file of await collect(root)) {
      const source = await readFile(file, "utf8");
      // O próprio check nomeia os padrões que proíbe.
      if (file.includes("scripts/check-")) continue;

      for (const rule of forbidden) {
        if (rule.pattern.test(source)) {
          failures.push(`${show(file)} — ${rule.reason}`);
        }
      }

      for (const client of forbiddenClients) {
        if (client.pattern.test(source)) {
          failures.push(
            `${show(file)} — F2: importa ${client.name}. Conteúdo de cliente nunca alimenta modelo, targeting ou recomendação (§4.7, §8.2).`,
          );
        }
      }
    }
  }

  // F1 — tags de terceiros nas rotas de experiência.
  for (const route of experienceRoutes) {
    for (const file of await collect(route)) {
      const source = await readFile(file, "utf8");
      for (const tag of thirdPartyTags) {
        if (tag.pattern.test(source)) {
          failures.push(
            `${show(file)} — F1: ${tag.name} numa rota de experiência. Zero tags de terceiros, nunca (§8.2).`,
          );
        }
      }
      if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(source)) {
        failures.push(
          `${show(file)} — F1: script de origem externa numa rota de experiência (§10.6.7).`,
        );
      }
    }
  }

  // F3 — o diretório não recebe nada derivado de conteúdo.
  for (const surface of directorySurfaces) {
    for (const file of await collect(surface)) {
      const source = await readFile(file, "utf8");
      for (const input of contentDerivedInputs) {
        if (input.test(source)) {
          failures.push(
            `${show(file)} — F3: o diretório referencia conteúdo de experiência (${input}). ` +
              `O encontro acontece por filtros declarados — país, região, modalidade, língua, área — nunca pelo que a pessoa escreveu (§8.2).`,
          );
        }
      }
    }
  }

  if (failures.length) {
    for (const failure of [...new Set(failures)]) {
      console.error(`check:privacy — ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      "check:privacy passou (ADR-004, F1 tags de terceiros, F2 targeting e LLM, F3 diretório neutro).",
    );
  }
}

void main();
