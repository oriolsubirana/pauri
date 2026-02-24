import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
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

type RsvpRow = {
    name: string
    email: string
    attending: boolean
    adults_count: number
    kids_count: number
    dietary_restrictions: string | null
    staying_until_night: boolean | null
    comments: string | null
    created_at: string
}

async function sendRsvpNotification(newRsvp: z.infer<typeof schema>) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set, skipping email notification')
        return
    }

    const resend = new Resend(apiKey)

    // Fetch all RSVPs (admin client bypasses RLS)
    const { data: allRsvps, error } = await supabaseAdmin
        .from('rsvps')
        .select('name, email, attending, adults_count, kids_count, dietary_restrictions, staying_until_night, comments, created_at')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching RSVPs for email:', error)
        return
    }

    const confirmed = (allRsvps as RsvpRow[]).filter(r => r.attending)
    const declined = (allRsvps as RsvpRow[]).filter(r => !r.attending)
    const totalAdults = confirmed.reduce((sum, r) => sum + (r.adults_count ?? 0), 0)
    const totalKids = confirmed.reduce((sum, r) => sum + (r.kids_count ?? 0), 0)

    const confirmedRows = confirmed.map(r => `
        <tr>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.name}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.email}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.adults_count ?? 1}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.kids_count ?? 0}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.dietary_restrictions ?? '—'}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.staying_until_night === true ? 'Sí' : r.staying_until_night === false ? 'No' : '—'}</td>
        </tr>`).join('')

    const declinedRows = declined.map(r => `
        <tr>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.name}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.email}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">${r.comments ?? '—'}</td>
        </tr>`).join('')

    const newRsvpBlock = newRsvp.attending
        ? `<p style="color:#5E6B3C;font-weight:600;">✅ ${newRsvp.name} ha confirmado su asistencia (${newRsvp.adults_count} adulto${(newRsvp.adults_count ?? 1) !== 1 ? 's' : ''}${(newRsvp.kids_count ?? 0) > 0 ? ` + ${newRsvp.kids_count} niño${(newRsvp.kids_count ?? 0) !== 1 ? 's' : ''}` : ''})</p>`
        : `<p style="color:#C4714A;font-weight:600;">❌ ${newRsvp.name} ha indicado que no puede asistir</p>`

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F6F2EC;margin:0;padding:24px;">
  <div style="max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <div style="background:#5E6B3C;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Oriol &amp; Paula · 19 de septiembre de 2026</h1>
      <p style="color:#d4dbb8;margin:6px 0 0;font-size:15px;">Nueva respuesta al formulario de confirmación</p>
    </div>

    <div style="padding:28px 32px;">
      ${newRsvpBlock}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <h2 style="color:#5E6B3C;font-size:17px;margin:0 0 16px;">Resumen actualizado</h2>
      <table style="width:100%;border-collapse:collapse;background:#f9f7f3;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px 16px;font-size:15px;">Confirmados</td>
          <td style="padding:12px 16px;font-size:20px;font-weight:700;color:#5E6B3C;text-align:right;">${confirmed.length} personas</td>
        </tr>
        <tr style="background:#f0ede6;">
          <td style="padding:12px 16px;font-size:15px;">De los cuales adultos</td>
          <td style="padding:12px 16px;font-size:20px;font-weight:700;color:#5E6B3C;text-align:right;">${totalAdults}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:15px;">De los cuales niños</td>
          <td style="padding:12px 16px;font-size:20px;font-weight:700;color:#5E6B3C;text-align:right;">${totalKids}</td>
        </tr>
        <tr style="background:#f0ede6;">
          <td style="padding:12px 16px;font-size:15px;">No asistirán</td>
          <td style="padding:12px 16px;font-size:20px;font-weight:700;color:#C4714A;text-align:right;">${declined.length}</td>
        </tr>
      </table>

      ${confirmed.length > 0 ? `
      <h2 style="color:#5E6B3C;font-size:17px;margin:28px 0 12px;">Lista de confirmados (${confirmed.length})</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#5E6B3C;color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Nombre</th>
            <th style="padding:8px 12px;text-align:left;">Email</th>
            <th style="padding:8px 12px;text-align:center;">Adultos</th>
            <th style="padding:8px 12px;text-align:center;">Niños</th>
            <th style="padding:8px 12px;text-align:left;">Restricciones alimentarias</th>
            <th style="padding:8px 12px;text-align:center;">Hasta las 22h</th>
          </tr>
        </thead>
        <tbody>
          ${confirmedRows}
        </tbody>
      </table>` : ''}

      ${declined.length > 0 ? `
      <h2 style="color:#C4714A;font-size:17px;margin:28px 0 12px;">No asistirán (${declined.length})</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#C4714A;color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Nombre</th>
            <th style="padding:8px 12px;text-align:left;">Email</th>
            <th style="padding:8px 12px;text-align:left;">Comentarios</th>
          </tr>
        </thead>
        <tbody>
          ${declinedRows}
        </tbody>
      </table>` : ''}
    </div>

    <div style="background:#f0ede6;padding:16px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Confirmación automática · Oriol &amp; Paula · Mas Corbella, Alcover</p>
    </div>
  </div>
</body>
</html>`

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    const notificationEmails = (process.env.NOTIFICATION_EMAILS ?? '')
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)

    if (notificationEmails.length === 0) {
        console.warn('NOTIFICATION_EMAILS not set, skipping email notification')
        return
    }

    await resend.emails.send({
        from: fromEmail,
        to: notificationEmails,
        subject: `${newRsvp.attending ? '✅' : '❌'} ${newRsvp.name} · RSVP Oriol & Paula`,
        html,
    })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Honeypot: bots fill hidden fields, humans don't
        if (body.website) {
            return NextResponse.json({ success: true }, { status: 200 })
        }

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

        // Send email notification (non-blocking)
        sendRsvpNotification(parsed.data).catch(err =>
            console.error('Email notification error:', err)
        )

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
