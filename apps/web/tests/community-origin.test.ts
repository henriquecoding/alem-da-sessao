import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/community/origin";

describe("community mutation origin boundary", () => {
  it("accepts an explicit same origin", () => {
    const request = new NextRequest("https://alemdasessao.com/api/public/x", {
      headers: {
        host: "alemdasessao.com",
        origin: "https://alemdasessao.com",
      },
    });
    expect(isSameOrigin(request)).toBe(true);
  });

  it("rejects a cross origin request", () => {
    const request = new NextRequest("https://alemdasessao.com/api/public/x", {
      headers: {
        host: "alemdasessao.com",
        origin: "https://example.com",
      },
    });
    expect(isSameOrigin(request)).toBe(false);
  });

  it("does not treat a missing Origin as trusted", () => {
    const request = new NextRequest("https://alemdasessao.com/api/public/x", {
      headers: { host: "alemdasessao.com" },
    });
    expect(isSameOrigin(request)).toBe(false);
  });
});
