import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const forwardedHost = req.headers.get('x-forwarded-host')
    const proto = req.headers.get('x-forwarded-proto') ?? 'https'
    const base = forwardedHost ? `${proto}://${forwardedHost}` : req.url
    const locale = req.cookies.get('locale')?.value ?? 'es'
    const response = NextResponse.redirect(
        new URL(`/${locale}`, base)
    )
    response.cookies.set('dashboard_auth', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    })
    return response
}
