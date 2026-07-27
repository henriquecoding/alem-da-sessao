import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * `script-src` permite inline — e a razão tem de ficar escrita, porque à
 * primeira vista parece uma diretiva relaxada por preguiça.
 *
 * A política anterior era `script-src 'self'` em produção. O efeito real não
 * era segurança: era um site morto. O Next serve o payload de hidratação em
 * `<script>` inline (`self.__next_f.push(...)`), um por fragmento, e o
 * navegador recusava-os todos. Em produção nada hidratava — nenhum menu
 * abria, nenhum botão respondia — e ninguém reparava porque em
 * desenvolvimento a diretiva já trazia `unsafe-inline`.
 *
 * As duas saídas honestas são nonce ou inline. O nonce obriga a gerar um
 * valor por pedido, o que tira as 62 páginas da geração estática e da cache
 * de CDN — um custo permanente de latência e de compute (§1.6) para fechar um
 * vetor que este produto não tem: não há um único sítio onde HTML de terceiros
 * seja renderizado, e o único `dangerouslySetInnerHTML` do código é uma
 * constante nossa.
 *
 * **Atenção ao dia em que isso mudar.** No momento em que qualquer superfície
 * renderizar HTML que não escrevemos, esta linha passa a nonce e as páginas
 * passam a dinâmicas. Até lá, o que fecha os caminhos de escalada de XSS são
 * as diretivas abaixo — `object-src`, `base-uri`, `frame-ancestors`,
 * `form-action` — e essas continuam fechadas.
 *
 * Nota de mecânica, não de gosto: **não se acrescenta um hash a esta linha.**
 * Quando existe um hash ou um nonce, o `unsafe-inline` é ignorado pelo
 * navegador, e o site volta ao estado morto. `tests/csp.test.ts` guarda isso.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' http://127.0.0.1:*",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    "@alem-da-sessao/authz",
    "@alem-da-sessao/db",
    "@alem-da-sessao/i18n",
    "@alem-da-sessao/tool-registry",
    "@alem-da-sessao/validation",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
