import { getMessages, locales } from "@alem-da-sessao/i18n";

function flatten(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [prefix];
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      flatten(nested, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
}

const [referenceLocale, ...otherLocales] = locales;
const referenceKeys = flatten(getMessages(referenceLocale)).sort();

for (const locale of otherLocales) {
  const localeKeys = flatten(getMessages(locale)).sort();
  const missing = referenceKeys.filter((key) => !localeKeys.includes(key));
  const extra = localeKeys.filter((key) => !referenceKeys.includes(key));

  if (missing.length || extra.length) {
    console.error({ locale, missing, extra });
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log(
    `i18n contracts match for ${locales.join(", ")} (${referenceKeys.length} keys).`,
  );
}
