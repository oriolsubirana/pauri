'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { Dictionary, Locale } from '@/dictionaries'

export function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-background/95 backdrop-blur-md shadow-soft border-b border-sand'
                : 'bg-transparent'
                }`}
        >
            <div className="container-main flex items-center justify-between h-16 md:h-20">
                <Link
                    href={`/${locale}`}
                    className="font-serif text-lg md:text-xl text-olive tracking-wide hover:opacity-80 transition-opacity"
                >
                    Paula & Oriol
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <a href="#event" className="font-sans text-sm text-stone hover:text-olive transition-colors">
                        {dict.nav.event}
                    </a>
                    <a href="#timeline" className="font-sans text-sm text-stone hover:text-olive transition-colors">
                        {dict.nav.timeline}
                    </a>
                    <a href="#faq" className="font-sans text-sm text-stone hover:text-olive transition-colors">
                        {dict.nav.faq}
                    </a>
                    <Link href={`/${locale}/rsvp`} className="btn-primary text-xs px-5 py-2.5 ml-2">
                        {dict.nav.rsvp}
                    </Link>
                    <Link href="/lista" className="font-sans text-xs text-stone/40 hover:text-olive transition-colors">
                        Admin
                    </Link>
                    <LanguageSwitcher locale={locale} />
                </nav>

                {/* Mobile: RSVP + Language + Hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    <LanguageSwitcher locale={locale} />
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                        className="p-1.5 text-stone hover:text-olive transition-colors"
                    >
                        <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
                        <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
                        <span className="block w-3 h-0.5 bg-current transition-all" />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-background border-t border-sand px-6 py-4 flex flex-col gap-4 shadow-soft">
                    <a
                        href="#event"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-sm text-stone hover:text-olive transition-colors"
                    >
                        {dict.nav.event}
                    </a>
                    <a
                        href="#timeline"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-sm text-stone hover:text-olive transition-colors"
                    >
                        {dict.nav.timeline}
                    </a>
                    <a
                        href="#faq"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-sm text-stone hover:text-olive transition-colors"
                    >
                        {dict.nav.faq}
                    </a>
                    <Link
                        href={`/${locale}/rsvp`}
                        onClick={() => setMenuOpen(false)}
                        className="btn-primary self-start text-xs px-5 py-2.5"
                    >
                        {dict.nav.rsvp}
                    </Link>
                    <Link
                        href="/lista"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-xs text-stone/40 hover:text-olive transition-colors self-start"
                    >
                        Lista invitados
                    </Link>
                </div>
            )}
        </header>
    )
}
