import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
    const response = NextResponse.redirect(
        new URL('/lista/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
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
