import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const cookieName = "ads-community-id";

function hmacSecret() {
  const configured = process.env.PUBLIC_EXPERIENCE_HMAC_SECRET;
  if (configured) return configured;
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "supabase") {
    return "fixture-only-community-secret";
  }
  throw new Error(
    "PUBLIC_EXPERIENCE_HMAC_SECRET is required in supabase mode.",
  );
}

export function communityIdentity(request: NextRequest) {
  const existing = request.cookies.get(cookieName)?.value;
  const token = existing ?? randomUUID();
  const actorHash = createHmac("sha256", hmacSecret())
    .update(token)
    .digest("hex");
  return { token, actorHash, isNew: !existing };
}

export function attachCommunityCookie(
  response: NextResponse,
  identity: ReturnType<typeof communityIdentity>,
) {
  if (!identity.isNew) return;
  response.cookies.set(cookieName, identity.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}
