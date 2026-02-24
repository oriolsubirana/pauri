import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const { password } = await req.json()

    const expected = process.env.DASHBOARD_PASSWORD
    if (!expected) {
        return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    if (password !== expected) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = createHash('sha256').update(expected).digest('hex')

    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.set('dashboard_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
}
