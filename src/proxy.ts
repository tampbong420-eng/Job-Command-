import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

const PUBLIC_EXACT = new Set(["/", "/login", "/signup"]);
const PUBLIC_PREFIXES = ["/api/health", "/api/auth/login", "/api/auth/signup"];

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const signedIn = Boolean(session);

  if (!signedIn && !isPublic(pathname) && (pathname.startsWith("/api/") || pathname.startsWith("/command") || pathname.startsWith("/jobs") || pathname.startsWith("/customers") || pathname.startsWith("/team") || pathname.startsWith("/settings"))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (signedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/command", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
