import Link from 'next/link'
import Image from 'next/image'
import type { Dictionary, Locale } from '@/dictionaries'
import fs from 'fs'
import path from 'path'

type Props = {
    dict: Dictionary
    locale: Locale
}

function hasIllustration(): boolean {
    try {
        return fs.existsSync(path.join(process.cwd(), 'public', 'hero-illustration.png'))
    } catch {
        return false
    }
}

export function HeroSection({ dict, locale }: Props) {
    const showIllustration = hasIllustration()

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-sand-light/40 via-background to-background pointer-events-none" />

            {/* Illustration as background */}
            {showIllustration ? (
                <div
                    className="absolute inset-0 pointer-events-none select-none"
                    style={{
                        maskImage: 'radial-gradient(ellipse 90% 85% at 50% 60%, black 20%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 60%, black 20%, transparent 70%)',
                    }}
                >
                    <Image
                        src="/hero-illustration.png"
                        alt="Celebració a Mas Corbella"
                        fill
                        unoptimized
                        className="object-cover object-[center_55%] opacity-50"
                        priority
                    />
                </div>
            ) : (
                /* Fallback decorative SVG */
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04] pointer-events-none select-none">
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="200" cy="200" rx="180" ry="180" stroke="#5E6B3C" strokeWidth="1" />
                        <ellipse cx="200" cy="200" rx="140" ry="140" stroke="#5E6B3C" strokeWidth="0.5" />
                        <path d="M200 40 Q240 120 200 200 Q160 120 200 40Z" stroke="#5E6B3C" strokeWidth="1" fill="none" />
                        <path d="M40 200 Q120 160 200 200 Q120 240 40 200Z" stroke="#5E6B3C" strokeWidth="1" fill="none" />
                        <path d="M200 360 Q160 280 200 200 Q240 280 200 360Z" stroke="#5E6B3C" strokeWidth="1" fill="none" />
                        <path d="M360 200 Q280 240 200 200 Q280 160 360 200Z" stroke="#5E6B3C" strokeWidth="1" fill="none" />
                    </svg>
                </div>
            )}

            {/* Text readability overlay — stronger on mobile */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 42%, rgba(246,242,236,0.92) 10%, rgba(246,242,236,0.6) 50%, transparent 80%)' }} />

            {/* Text content — on top of illustration */}
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
                <p className="font-sans text-xs tracking-[0.25em] uppercase text-terracotta/80 font-medium animate-[fadeIn_1s_ease-out_forwards]">
                    19 · 09 · 2026
                </p>

                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-olive leading-none tracking-tight animate-[fadeUp_0.8s_ease-out_0.2s_both]" style={{ textShadow: '0 2px 20px rgba(246,242,236,0.9)' }}>
                    {dict.hero.names}
                </h1>

                <span className="ornament" />

                <p className="font-sans text-base md:text-lg text-stone font-light tracking-wide animate-[fadeUp_0.8s_ease-out_0.4s_both]" style={{ textShadow: '0 0 16px rgba(246,242,236,1), 0 0 32px rgba(246,242,236,1)' }}>
                    {dict.hero.subtitle}
                </p>
                <p className="font-serif text-xl md:text-2xl text-olive/70 italic animate-[fadeUp_0.8s_ease-out_0.5s_both]" style={{ textShadow: '0 0 16px rgba(246,242,236,1), 0 0 32px rgba(246,242,236,1)' }}>
                    {dict.hero.date}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 animate-[fadeUp_0.8s_ease-out_0.7s_both]">
                    <Link href={`/${locale}/rsvp`} className="btn-primary">
                        {dict.hero.cta}
                    </Link>
                    <a href="#event" className="btn-secondary">
                        {dict.nav.event}
                    </a>
                </div>
            </div>

            {/* Scroll cue */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[fadeIn_1s_ease-out_1.2s_both]">
                <span className="block w-px h-10 bg-gradient-to-b from-transparent to-stone/30" />
            </div>
        </section>
    )
}
