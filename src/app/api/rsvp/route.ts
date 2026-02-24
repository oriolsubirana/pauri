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
    locale: z.enum(['ca', 'es', 'en']).default('es'),
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

const guestEmailCopy = {
    es: {
        subject_yes: 'Confirmación recibida · Oriol & Paula · 19 septiembre',
        subject_no: 'Gracias por avisarnos · Oriol & Paula',
        greeting_yes: '¡Muchas gracias por confirmar tu asistencia!',
        greeting_no: 'Gracias por avisarnos',
        body_no: 'Lamentamos que no puedas acompañarnos, ¡te echaremos de menos! Si algo cambia antes del 31 de agosto, no dudes en escribirnos.',
        summary_title: 'Tu confirmación',
        adults: 'Adultos',
        kids: 'Niños',
        dietary: 'Restricciones alimentarias',
        staying: 'Te quedas hasta el final (22:00)',
        staying_yes: 'Sí',
        staying_no: 'Me voy antes',
        none: 'Ninguna',
        info_title: 'El día',
        date: 'Sábado 19 de septiembre de 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Abrir en Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: 'Os enviaremos la información de parking y acceso una semana antes del evento.',
        footer: 'Con cariño, Paula & Oriol',
    },
    ca: {
        subject_yes: 'Confirmació rebuda · Oriol & Paula · 19 setembre',
        subject_no: 'Gràcies per avisar-nos · Oriol & Paula',
        greeting_yes: 'Moltes gràcies per confirmar la teva assistència!',
        greeting_no: 'Gràcies per avisar-nos',
        body_no: "Llàstima que no puguis acompanyar-nos, t'enyorarem! Si res canvia abans del 31 d'agost, escriu-nos.",
        summary_title: 'La teva confirmació',
        adults: 'Adults',
        kids: 'Nens',
        dietary: 'Restriccions alimentàries',
        staying: 'Et quedes fins al final (22:00)',
        staying_yes: 'Sí',
        staying_no: "Me'n vaig abans",
        none: 'Cap',
        info_title: 'El dia',
        date: 'Dissabte 19 de setembre de 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Obrir a Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: "Us enviarem la informació d'aparcament i accés una setmana abans de l'esdeveniment.",
        footer: 'Amb afecte, Paula & Oriol',
    },
    en: {
        subject_yes: 'RSVP confirmed · Oriol & Paula · September 19th',
        subject_no: 'Thanks for letting us know · Oriol & Paula',
        greeting_yes: 'Thank you so much for confirming your attendance!',
        greeting_no: 'Thanks for letting us know',
        body_no: "We're sorry you can't make it — we'll miss you! If anything changes before August 31st, feel free to reach out.",
        summary_title: 'Your RSVP',
        adults: 'Adults',
        kids: 'Kids',
        dietary: 'Dietary restrictions',
        staying: 'Staying until the end (22:00)',
        staying_yes: 'Yes',
        staying_no: 'Leaving earlier',
        none: 'None',
        info_title: 'The day',
        date: 'Saturday, September 19, 2026 · 12:00–22:00',
        location: 'Mas Corbella, Alcover, Tarragona',
        maps_label: 'Open in Google Maps',
        maps_url: 'https://maps.app.goo.gl/mVVaFuXkNsY3vTh96',
        parking: "We'll send you parking and access details one week before the event.",
        footer: 'With love, Paula & Oriol',
    },
}

async function sendGuestConfirmation(rsvp: z.infer<typeof schema>) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return

    const resend = new Resend(apiKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const locale = rsvp.locale ?? 'es'
    const t = guestEmailCopy[locale]

    let html: string

    if (rsvp.attending) {
        const summaryRows = [
            `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.adults}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.adults_count}</td></tr>`,
            rsvp.kids_count > 0
                ? `<tr style="background:#f9f7f3;"><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.kids}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.kids_count}</td></tr>`
                : '',
            rsvp.dietary_restrictions
                ? `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.dietary}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.dietary_restrictions}</td></tr>`
                : `<tr><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.dietary}</td><td style="padding:8px 16px;font-size:14px;color:#9ca3af;">${t.none}</td></tr>`,
            rsvp.staying_until_night !== null && rsvp.staying_until_night !== undefined
                ? `<tr style="background:#f9f7f3;"><td style="padding:8px 16px;color:#6b7280;font-size:14px;">${t.staying}</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${rsvp.staying_until_night ? t.staying_yes : t.staying_no}</td></tr>`
                : '',
        ].join('')

        html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F6F2EC;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#5E6B3C;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Paula &amp; Oriol · 19.09.2026</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:17px;color:#374151;margin:0 0 8px;">Hola ${rsvp.name},</p>
      <p style="font-size:15px;color:#5E6B3C;font-weight:600;margin:0 0 24px;">✅ ${t.greeting_yes}</p>

      <h2 style="color:#5E6B3C;font-size:15px;margin:0 0 12px;">${t.summary_title}</h2>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;background:#fff;border:1px solid #e5e7eb;">
        <tbody>${summaryRows}</tbody>
      </table>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">

      <h2 style="color:#5E6B3C;font-size:15px;margin:0 0 12px;">📅 ${t.info_title}</h2>
      <p style="font-size:14px;color:#374151;margin:0 0 4px;">${t.date}</p>
      <p style="font-size:14px;color:#374151;margin:0 0 12px;">📍 ${t.location}</p>
      <p style="margin:0 0 16px;">
        <a href="${t.maps_url}" style="color:#5E6B3C;font-size:14px;">${t.maps_label}</a>
      </p>
      <p style="font-size:13px;color:#9ca3af;background:#f9f7f3;padding:12px 16px;border-radius:8px;margin:0 0 24px;">${t.parking}</p>

      <p style="font-size:14px;color:#6b7280;margin:0;">${t.footer}</p>
    </div>
    <div style="background:#f0ede6;padding:12px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Mas Corbella · Alcover · Tarragona</p>
    </div>
  </div>
</body></html>`
    } else {
        html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F6F2EC;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#5E6B3C;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Paula &amp; Oriol · 19.09.2026</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:17px;color:#374151;margin:0 0 8px;">Hola ${rsvp.name},</p>
      <p style="font-size:15px;color:#C4714A;font-weight:600;margin:0 0 16px;">🙏 ${t.greeting_no}</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">${t.body_no}</p>
      <p style="font-size:14px;color:#6b7280;margin:0;">${t.footer}</p>
    </div>
    <div style="background:#f0ede6;padding:12px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Mas Corbella · Alcover · Tarragona</p>
    </div>
  </div>
</body></html>`
    }

    await resend.emails.send({
        from: fromEmail,
        to: [rsvp.email],
        subject: rsvp.attending ? t.subject_yes : t.subject_no,
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
        sendGuestConfirmation(parsed.data).catch(err =>
            console.error('Guest confirmation email error:', err)
        )

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
