'use client'

import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/dictionaries'

const localeLabels: Record<Locale, string> = {
    ca: 'CAT',
    es: 'ESP',
    en: 'ENG',
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
    const pathname = usePathname()
    const router = useRouter()

    const switchLocale = (newLocale: Locale) => {
        // Replace current locale segment with new one
        const segments = pathname.split('/')
        segments[1] = newLocale
        router.push(segments.join('/'))
    }

    return (
        <div className="flex items-center gap-1">
            {locales.map((l, i) => (
                <span key={l} className="flex items-center">
                    <button
                        onClick={() => switchLocale(l)}
                        className={`font-sans text-xs tracking-widest transition-all duration-150 px-1 py-0.5 rounded ${l === locale
                                ? 'text-olive font-semibold'
                                : 'text-stone hover:text-olive'
                            }`}
                    >
                        {localeLabels[l]}
                    </button>
                    {i < locales.length - 1 && (
                        <span className="text-sand-dark text-xs select-none">·</span>
                    )}
                </span>
            ))}
        </div>
    )
}
