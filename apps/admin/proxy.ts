import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 Proxy / Route Protection Middleware
 * Guards administrative routes by verifying the active session cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie =
    request.cookies.get("admin_session")?.value ||
    request.cookies.get("refreshToken")?.value

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"

  // Explicit expired-session or logout redirect: always allow /login and purge stale cookies
  // (including HttpOnly refreshToken) to prevent any redirect loop.
  const isForcedLogin =
    request.nextUrl.searchParams.get("expired") === "1" ||
    request.nextUrl.searchParams.get("logged_out") === "1"

  if (pathname === "/login" && isForcedLogin) {
    const response = NextResponse.next()
    response.cookies.delete("admin_session")
    response.cookies.delete("refreshToken")
    return response
  }

  // Unauthenticated user attempting to access protected route -> redirect to /login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user attempting to access /login -> redirect to dashboard
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
