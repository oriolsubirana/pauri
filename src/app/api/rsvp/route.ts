import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    attending: z.boolean(),
    adults_count: z.number().int().min(0).max(50).default(1),
    kids_count: z.number().int().min(0).max(50).default(0),
    dietary_restrictions: z.string().max(500).optional().nullable(),
    staying_until_night: z.boolean().optional().nullable(),
    song_request: z.string().max(300).optional().nullable(),
    comments: z.string().max(1000).optional().nullable(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = schema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { error } = await supabase.from('rsvps').insert([parsed.data])

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
