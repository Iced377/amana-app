
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'ar']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  
  try {
    return match(languages, locales, defaultLocale)
  } catch (e) {
    // Catch error if match fails (e.g. languages is empty)
    return defaultLocale
  }
}

const isAuthenticated = (req: NextRequest) => {
  // MOCK: Allow access for UI development
  return true; 
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    // Add the locale prefix to the pathname
    let newPathname = `/${locale}${pathname}`
    if (pathname.endsWith('/') && pathname.length > 1) {
        newPathname = newPathname.slice(0, -1); // Avoid double slashes like /en//dashboard
    }
    
    return NextResponse.redirect(
      new URL(newPathname, request.url)
    )
  }
  
  // Extract current locale from pathname for auth checks
  const currentLocale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.startsWith(`/${currentLocale}`) ? pathname.substring(`/${currentLocale}`.length) || '/' : pathname;


  // Protect dashboard routes
  if (pathWithoutLocale.startsWith('/dashboard')) {
    if (!isAuthenticated(request)) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}
