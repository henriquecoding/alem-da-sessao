import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      environment: process.env.APP_ENV ?? "local",
      dataMode: process.env.NEXT_PUBLIC_DATA_MODE ?? "fixture",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
