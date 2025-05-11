import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a mock authentication check.
// In a real Firebase app, you would use Firebase Admin SDK or client-side checks with redirects.
const isAuthenticated = (req: NextRequest) => {
  // For now, let's assume the user is always authenticated if they try to access dashboard.
  // Or, you could set a simple cookie for demo purposes.
  // const sessionToken = req.cookies.get('sessionToken')?.value;
  // return !!sessionToken;
  return true; // MOCK: Allow access for UI development
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated(request)) {
      // If not authenticated, redirect to login page
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If authenticated and trying to access login/signup, redirect to dashboard
  // This part is commented out for easier UI dev without actual auth state.
  /*
  if (isAuthenticated(request) && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets like images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
