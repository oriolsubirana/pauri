// Shared locale types - safe to import in client components
export const locales = ['ca', 'es', 'en'] as const
export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale)
}
