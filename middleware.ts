import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", path)

  // Allow public routes
  const publicRoutes = ["/", "/auth", "/api/auth", "/patient/ai-bot"]
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  }

  // Check for session cookie (without Prisma - just cookie check)
  // NextAuth v5 uses different cookie names depending on environment
  const sessionToken = req.cookies.get("next-auth.session-token") || 
                       req.cookies.get("__Secure-next-auth.session-token") ||
                       req.cookies.get("authjs.session-token") ||
                       req.cookies.get("__Secure-authjs.session-token")

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  // For role-based access, we'll let the page handle it
  // Middleware just checks authentication, pages will check roles
  // This avoids Prisma edge runtime issues
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })
}

export const config = {
  matcher: [
    "/patient/:path*",
    "/doctor/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/read/:path*",
    "/listen/:path*",
  ],
}

