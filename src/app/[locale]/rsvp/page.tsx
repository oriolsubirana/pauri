import { getDictionary, type Locale } from '@/dictionaries'
import { RSVPForm } from '@/components/rsvp/RSVPForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function RSVPPage({ params }: Props) {
    const { locale } = await params
    const dict = await getDictionary(locale)
    const r = dict.rsvp

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container-main max-w-2xl">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-stone hover:text-olive transition-colors font-sans text-sm mb-10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Paula & Oriol
                </Link>

                <div className="text-center mb-10">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-terracotta/80 font-medium mb-3">
                        19 · 09 · 2026
                    </p>
                    <h1 className="section-title mb-4">{r.title}</h1>
                    <span className="ornament mb-4" />
                    <p className="section-subtitle">{r.subtitle}</p>
                </div>

                <div className="card">
                    <RSVPForm dict={dict} locale={locale as Locale} />
                </div>
            </div>
        </div>
    )
}
