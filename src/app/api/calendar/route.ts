import { NextRequest } from 'next/server'
import { EVENT } from '@/lib/utils'
import { isValidLocale } from '@/dictionaries/types'

export const runtime = 'nodejs'

// Backslash, comma and semicolon are iCalendar syntax, so they travel escaped
const escapeText = (text: string) => text.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n')

/**
 * The celebration as an .ics download, for Apple Calendar (and Outlook, and
 * anything else that speaks iCalendar). Google gets its own pre-filled form.
 */
export async function GET(request: NextRequest) {
    const asked = request.nextUrl.searchParams.get('locale') ?? 'es'
    const locale = isValidLocale(asked) ? asked : 'es'

    const calendar = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Paula & Oriol//Wedding//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${EVENT.uid}`,
        `DTSTAMP:${EVENT.stamp}`,
        `DTSTART:${EVENT.start}`,
        `DTEND:${EVENT.end}`,
        `SUMMARY:${escapeText(EVENT.title)}`,
        `DESCRIPTION:${escapeText(EVENT.details[locale])}`,
        `LOCATION:${escapeText(EVENT.location)}`,
        'END:VEVENT',
        'END:VCALENDAR',
        '',
    ].join('\r\n')

    return new Response(calendar, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="paula-oriol.ics"',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}
