import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/cookies";

/**
 * Request proxy (Next.js' successor to middleware).
 *
 * It does one cheap thing: if a request has no session cookie at all, send the
 * visitor to the sign-in page and remember where they were headed. Real
 * authorization still happens in `requireUser()` on the server, because a
 * cookie can exist while its session row is expired or deleted.
 */

const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (isPublicRoute) return NextResponse.next();

  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Skip Next.js internals and any request for a file (anything with a dot).
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
