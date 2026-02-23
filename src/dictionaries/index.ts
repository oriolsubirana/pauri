import type caDict from './ca.json'

export type Dictionary = typeof caDict

// Re-export client-safe types
export type { Locale } from './types'
export { locales, isValidLocale } from './types'

const dictionaries: Record<string, () => Promise<Dictionary>> = {
    ca: () => import('./ca.json').then((m) => m.default),
    es: () => import('./es.json').then((m) => m.default),
    en: () => import('./en.json').then((m) => m.default),
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
    const loader = dictionaries[locale] ?? dictionaries.ca
    return loader()
}
