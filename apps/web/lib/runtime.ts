import type { ToolRuntime } from "@alem-da-sessao/tool-registry";

export function dataMode(): "fixture" | "supabase" {
  return process.env.NEXT_PUBLIC_DATA_MODE === "supabase"
    ? "supabase"
    : "fixture";
}

export function toolRuntime(): ToolRuntime {
  return dataMode() === "fixture" ? "fixture" : "production";
}

export function publicLaunchIsEnabled(): boolean {
  return (
    process.env.APP_ENV === "production" &&
    process.env.PUBLIC_LAUNCH_ENABLED === "true"
  );
}

export function isFixtureMode(): boolean {
  return dataMode() === "fixture";
}
