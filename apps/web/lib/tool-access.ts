import "server-only";

import { getToolBySlug, toolCanRun } from "@alem-da-sessao/tool-registry";
import { notFound } from "next/navigation";
import { toolRuntime } from "@/lib/runtime";

export function requireRunnableTool(
  slug: string,
  audience: "public" | "client" | "professional",
) {
  const tool = getToolBySlug(slug);

  if (!tool || !toolCanRun(tool, toolRuntime(), audience)) {
    notFound();
  }

  return tool;
}
