
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, fallbackLng, LocaleTypes } from './locales/settings'

// Convert `locales` (ReadonlyArray) to a mutable string array for Negotiator and intl-localematcher
const mutableLocales: string[] = [...locales];

function getLocale(request: NextRequest): LocaleTypes {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(mutableLocales)

  try {
    return match(languages, mutableLocales, fallbackLng) as LocaleTypes;
  } catch (e) {
    // If match throws an error (e.g., no suitable locale found), return fallback
    return fallbackLng;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static files
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}
