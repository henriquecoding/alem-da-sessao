import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToolBySlug, toolCanRun } from "@alem-da-sessao/tool-registry";
import {
  attachCommunityCookie,
  communityIdentity,
} from "@/lib/community/identity";
import { isSameOrigin } from "@/lib/community/origin";
import { supportLoadStructure } from "@/lib/community/store";
import { toolRuntime } from "@/lib/runtime";

const postIdSchema = z.uuid();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const tool = getToolBySlug("estruturas-de-carga");
  if (!tool || !toolCanRun(tool, toolRuntime(), "public")) {
    return NextResponse.json({ error: "tool-unavailable" }, { status: 404 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid-origin" }, { status: 403 });
  }

  const { postId } = await context.params;
  if (!postIdSchema.safeParse(postId).success) {
    return NextResponse.json({ error: "invalid-structure" }, { status: 404 });
  }

  try {
    const identity = communityIdentity(request);
    const result = await supportLoadStructure(postId, identity.actorHash);
    const response = NextResponse.json(result);
    attachCommunityCookie(response, identity);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "structure-not-found") {
      return NextResponse.json(
        { error: "structure-not-found" },
        { status: 404 },
      );
    }
    if (error instanceof Error && error.message === "own-structure") {
      return NextResponse.json({ error: "own-structure" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "community-unavailable" },
      { status: 503 },
    );
  }
}
