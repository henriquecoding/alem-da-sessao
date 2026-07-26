import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["app", "components", "lib"];
const forbidden = [
  { pattern: /\blocalStorage\b/, reason: "intimate drafts cannot use localStorage" },
  {
    pattern: /\bsessionStorage\b/,
    reason: "intimate drafts cannot use sessionStorage",
  },
  { pattern: /\bindexedDB\b/, reason: "intimate drafts cannot use IndexedDB" },
  { pattern: /session[-_ ]?replay/i, reason: "session replay is forbidden" },
  {
    pattern: /NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE/,
    reason: "privileged keys cannot be public",
  },
];

async function filesUnder(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(child)));
    } else if ([".ts", ".tsx", ".js", ".mjs"].includes(extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

async function main() {
  let failed = false;

  for (const root of roots) {
    for (const file of await filesUnder(root)) {
      const source = await readFile(file, "utf8");
      for (const rule of forbidden) {
        if (rule.pattern.test(source)) {
          console.error(`${file}: ${rule.reason}`);
          failed = true;
        }
      }
    }
  }

  if (failed) {
    process.exitCode = 1;
  } else {
    console.log("privacy source checks passed.");
  }
}

void main();
