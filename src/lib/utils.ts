import type { Locale } from '@/dictionaries/types'

export const EVENT_DATE = new Date('2026-09-19T12:00:00')

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/1YxaEdhd6mCAbZcK9'

// The celebration as calendars want it. Times are UTC: 12:00–22:00 in Madrid.
export const EVENT = {
    title: 'Paula & Oriol',
    start: '20260919T100000Z',
    end: '20260919T200000Z',
    location: 'Mas Corbella, Alcover, Tarragona',
    uid: 'boda-paula-oriol-20260919@pauri',
    // When the invitation was published — calendars use it to spot updates
    stamp: '20260101T000000Z',
    details: {
        ca: 'Aperitiu, paella, piscina & música',
        es: 'Aperitivo, paella, piscina & música',
        en: 'Finger food, paella, pool & music',
    },
} as const

/** Google Calendar's "add event" form, pre-filled. */
export function googleCalendarUrl(locale: Locale): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: EVENT.title,
        dates: `${EVENT.start}/${EVENT.end}`,
        details: EVENT.details[locale],
        location: EVENT.location,
    })
    return `https://calendar.google.com/calendar/render?${params}`
}

/** An .ics file — Apple Calendar on iPhone and Mac, and anything else that reads iCalendar. */
export function icsUrl(locale: Locale): string {
    return `/api/calendar?locale=${locale}`
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

export function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
}
