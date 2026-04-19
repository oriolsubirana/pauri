import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const schema = z
    .object({
        needs_transfer: z.boolean().nullable().optional(),
        sleeps_over: z.boolean().nullable().optional(),
    })
    .refine(
        (data) => 'needs_transfer' in data || 'sleeps_over' in data,
        { message: 'At least one field is required' },
    )

function isAuthorized(req: NextRequest): boolean {
    const password = process.env.DASHBOARD_PASSWORD
    if (!password) return false
    const expected = createHash('sha256').update(password).digest('hex')
    const cookie = req.cookies.get('dashboard_auth')
    return Boolean(cookie && cookie.value === expected)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid data', details: parsed.error.flatten() },
            { status: 400 },
        )
    }

    const { error } = await supabaseAdmin
        .from('rsvps')
        .update(parsed.data)
        .eq('id', id)

    if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
