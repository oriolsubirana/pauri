export const EVENT_DATE = new Date('2026-09-19T12:00:00')

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/1YxaEdhd6mCAbZcK9'

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
