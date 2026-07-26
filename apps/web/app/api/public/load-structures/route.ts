import { NextRequest, NextResponse } from "next/server";
import { publicLoadStructureSchema } from "@alem-da-sessao/validation";
import {
  attachCommunityCookie,
  communityIdentity,
  isSameOrigin,
} from "@/lib/community/identity";
import {
  listPublicLoadStructures,
  publishLoadStructure,
} from "@/lib/community/store";

export async function GET() {
  try {
    const posts = await listPublicLoadStructures();
    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "community-unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "invalid-origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "payload-too-large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const parsed = publicLoadStructureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-structure" }, { status: 422 });
  }

  try {
    const identity = communityIdentity(request);
    const publication = await publishLoadStructure(
      parsed.data,
      identity.actorHash,
    );
    const response = NextResponse.json(publication, {
      status: publication.status === "rejected" ? 422 : 201,
    });
    attachCommunityCookie(response, identity);
    return response;
  } catch {
    return NextResponse.json(
      { error: "community-unavailable" },
      { status: 503 },
    );
  }
}
