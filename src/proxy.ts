import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication.
  // /privacy and /terms must be reachable without login (required by Google's
  // OAuth consent screen and for general legal accessibility).
  const publicRoutes = [
    "/",
    "/login",
    "/resume-result",
    "/privacy",
    "/terms",
    "/robots.txt",
    "/sitemap.xml",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/resume-result/")
  );

  // API routes are handled separately
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!isPublicRoute) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
