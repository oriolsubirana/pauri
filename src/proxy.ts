import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ca', 'es', 'en']
const defaultLocale = 'ca'

// Next.js 16: file is named proxy.ts, export must also be named "proxy"
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip API routes, static files, Next.js internals
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Check if the pathname already starts with a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
        return NextResponse.next()
    }

    // Redirect root to default locale
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(url)
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
