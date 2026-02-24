import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const response = NextResponse.redirect(
        new URL('/lista/login', req.url)
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
