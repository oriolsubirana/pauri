import { getDictionary } from '@/dictionaries'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Locale } from '@/dictionaries'
import type { Metadata } from 'next'

type Props = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

const metadataByLocale: Record<string, Metadata> = {
    ca: {
        title: 'Paula & Oriol — 19 Setembre 2026',
        description: 'Un dia per compartir amb amics i celebrar la vida.',
    },
    es: {
        title: 'Paula & Oriol — 19 Septiembre 2026',
        description: 'Un día para compartir con amigos y celebrar la vida.',
    },
    en: {
        title: 'Paula & Oriol — September 19th 2026',
        description: 'A day to share with friends and celebrate life.',
    },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    return metadataByLocale[locale] ?? metadataByLocale.ca
}

export async function generateStaticParams() {
    return [{ locale: 'ca' }, { locale: 'es' }, { locale: 'en' }]
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <div className="flex flex-col min-h-screen">
            <Header dict={dict} locale={locale as Locale} />
            <main className="flex-1">{children}</main>
            <Footer dict={dict} />
        </div>
    )
}
