import { NextRequest, NextResponse } from "next/server";
import { isLocaleSegment } from "@alem-da-sessao/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment) {
    return NextResponse.redirect(new URL("/pt-pt", request.url));
  }

  if (!isLocaleSegment(firstSegment)) {
    const target = request.nextUrl.clone();
    target.pathname = `/pt-pt${pathname}`;
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
