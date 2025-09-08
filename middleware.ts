import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('fm-session')
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without session
  if (!session && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login with active session
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}