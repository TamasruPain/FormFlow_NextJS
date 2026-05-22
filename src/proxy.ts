import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (Better Auth session token)
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isLoggedIn = !!sessionToken?.value;

  // Redirect logged-in users away from auth pages to /dashboard
  if (isLoggedIn && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes — skip auth check for non-logged-in users
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/embed"];
  const isPublic =
    publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/submit") ||
    pathname.startsWith("/api/ai/webhook");

  if (isPublic) return NextResponse.next();

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image.png).*)"],
};
