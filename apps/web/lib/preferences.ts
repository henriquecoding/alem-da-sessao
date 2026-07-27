/**
 * Preferências de apresentação — tema e língua.
 *
 * Duas regras governam este módulo, e as duas existem por causa do ADR-004.
 *
 * 1. **Nada de `localStorage`, `sessionStorage` ou IndexedDB.** É proibido em
 *    todo o produto e `check:privacy` falha o build se aparecer. Uma
 *    preferência de apresentação não é rascunho íntimo, mas abrir a exceção
 *    seria abrir a porta — e a porta seguinte já não seria uma preferência.
 *
 * 2. **O único cookie que o produto escreve é este, e escreve-se aqui.**
 *    Não tem identificador, não tem sessão, não viaja para terceiros e só
 *    existe depois de alguém carregar num botão. `check:privacy` recusa
 *    `document.cookie` em qualquer outro ficheiro precisamente para que o dia
 *    em que alguém quiser um cookie de analítica seja um dia em que tenha de
 *    apagar esta frase primeiro.
 */

/** Sem prefixo de produto: o cookie é do site, não de um utilizador. */
export const themeCookie = "luz-tema";
export const localeCookie = "luz-lingua";

/**
 * Um ano. É uma preferência de apresentação — reperguntar de três em três
 * meses seria ruído, e mantê-la para sempre seria presunção.
 */
const maxAge = 60 * 60 * 24 * 365;

export const themeChoices = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof themeChoices)[number];

export function isThemeChoice(value: string): value is ThemeChoice {
  return (themeChoices as readonly string[]).includes(value);
}

/** Tema efetivo: o que os olhos veem, já resolvido contra o sistema. */
export type ResolvedTheme = "light" | "dark";

/**
 * O script que corre antes da primeira pintura.
 *
 * Tem de ser inline e tem de ser síncrono: qualquer outra coisa produz o
 * flash branco que todos os sites com tema escuro têm e ninguém assume. Como
 * a CSP em produção é `script-src 'self'` — sem `unsafe-inline` — a origem
 * deste texto é partilhada com `next.config.ts`, que calcula o hash SHA-256
 * dele e o acrescenta à diretiva. Mudar o script muda o hash sozinho; não há
 * um segundo sítio para esquecer.
 *
 * O que ele faz é deliberadamente mínimo. Não lê `matchMedia`, não resolve
 * nada: `color-scheme: light dark` no `:root` já faz o navegador escolher, e
 * o atributo só existe quando alguém escolheu ao contrário do sistema.
 */
export const themeBootstrapScript =
  `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${themeCookie}=(light|dark)/);` +
  `if(m){document.documentElement.setAttribute("data-theme",m[1]);}}catch(e){}})();`;

/** Lê a escolha guardada. `system` é a ausência de cookie, não um valor. */
export function readThemeChoice(): ThemeChoice {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${themeCookie}=(light|dark)`),
  );
  return match ? (match[1] as ThemeChoice) : "system";
}

/**
 * Aplica e guarda. Aplicar é mudar um atributo na raiz — toda a paleta está
 * em `light-dark()` e depende de `color-scheme`, portanto não há uma segunda
 * folha de estilos a trocar nem uma classe a propagar.
 */
export function writeThemeChoice(choice: ThemeChoice) {
  const root = document.documentElement;

  if (choice === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${themeCookie}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  root.setAttribute("data-theme", choice);
  document.cookie = `${themeCookie}=${choice}; path=/; max-age=${maxAge}; samesite=lax`;
}

/**
 * Guarda a língua escolhida. A língua vive no URL — este cookie serve só para
 * `/` saber para onde encaminhar quem chega sem segmento, em vez de adivinhar
 * pelo cabeçalho do navegador e acertar metade das vezes.
 */
export function writeLocalePreference(segment: string) {
  document.cookie = `${localeCookie}=${segment}; path=/; max-age=${maxAge}; samesite=lax`;
}
