import { toolRegistry, type ToolManifest } from "@alem-da-sessao/tool-registry";

const launch =
  process.env.APP_ENV === "production" &&
  process.env.PUBLIC_LAUNCH_ENABLED === "true";

if (!launch) {
  console.log(
    "check:release-readiness passou em pré-lançamento (noindex e fixture permitidos).",
  );
  process.exit(0);
}

const failures: string[] = [];
const required = [
  "LEGAL_DPIA_EVIDENCE_ID",
  "PENTEST_EVIDENCE_ID",
  "RLS_MATRIX_EVIDENCE_ID",
  "NEXT_PUBLIC_SUPABASE_CLINICAL_URL",
  "NEXT_PUBLIC_SUPABASE_CLINICAL_ANON_KEY",
  "SUPABASE_PLATFORM_URL",
  "SUPABASE_PLATFORM_SERVICE_ROLE_KEY",
  "SUPABASE_PUBLIC_URL",
  "SUPABASE_PUBLIC_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "BILLING_RECONCILIATION_EVIDENCE_ID",
] as const;

if (process.env.NEXT_PUBLIC_DATA_MODE !== "supabase") {
  failures.push("produção exige NEXT_PUBLIC_DATA_MODE=supabase.");
}

for (const name of required) {
  if (!process.env[name]?.trim()) failures.push(`${name} está em falta.`);
}

const manifests: readonly ToolManifest[] = toolRegistry;

for (const tool of manifests) {
  if (tool.status !== "published") continue;
  if (tool.review.clinicalStatus !== "approved") {
    failures.push(`${tool.id} publicada sem aprovação clínica.`);
  }
  const evidenceName = `CLINICAL_REVIEW_EVIDENCE_${tool.id
    .toUpperCase()
    .replaceAll("-", "_")}`;
  if (!process.env[evidenceName]?.trim()) {
    failures.push(`${evidenceName} está em falta.`);
  }
}

if (failures.length) {
  console.error("check:release-readiness bloqueou o lançamento:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exitCode = 1;
} else {
  console.log("check:release-readiness passou para o modo de lançamento.");
}
