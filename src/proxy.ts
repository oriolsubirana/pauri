import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const locales = ['ca', 'es', 'en']
const defaultLocale = 'ca'

// Next.js 16: file is named proxy.ts, export must also be named "proxy"
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Lista auth protection
    if (pathname.startsWith('/lista') && pathname !== '/lista/login') {
        const cookie = request.cookies.get('dashboard_auth')
        const password = process.env.DASHBOARD_PASSWORD
        const expected = password ? createHash('sha256').update(password).digest('hex') : null

        if (!expected || !cookie || cookie.value !== expected) {
            return NextResponse.redirect(new URL('/lista/login', request.url))
        }
    }

    // Skip API routes, static files, Next.js internals
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/lista') ||
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
