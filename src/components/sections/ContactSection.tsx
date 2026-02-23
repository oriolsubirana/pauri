'use client'

import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'
import { Phone } from 'lucide-react'

export function ContactSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()
    const c = dict.contact

    return (
        <section id="contact" className="section-spacing bg-sand-light/50">
            <div className="container-main">
                <div ref={ref} className="fade-in-section text-center">
                    <h2 className="section-title">{c.title}</h2>
                    <span className="ornament mt-4 mb-6" />
                    <p className="section-subtitle max-w-md mx-auto mb-10">{c.subtitle}</p>

                    <div className="flex flex-col gap-3 max-w-lg mx-auto">
                        {/* Phones */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a
                                href="tel:+41766898723"
                                className="flex items-center gap-3 bg-background rounded-2xl px-5 py-4 shadow-card border border-sand hover:border-olive/40 hover:shadow-soft transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-olive/20 transition-colors">
                                    <Phone className="w-4 h-4 text-olive" />
                                </div>
                                <div className="text-left">
                                    <p className="font-sans text-xs tracking-widest uppercase text-stone mb-0.5">Oriol</p>
                                    <p className="font-sans text-sm font-medium text-[var(--color-text)]">+41 76 689 87 23</p>
                                </div>
                            </a>
                            <a
                                href="tel:+41789279474"
                                className="flex items-center gap-3 bg-background rounded-2xl px-5 py-4 shadow-card border border-sand hover:border-olive/40 hover:shadow-soft transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-olive/20 transition-colors">
                                    <Phone className="w-4 h-4 text-olive" />
                                </div>
                                <div className="text-left">
                                    <p className="font-sans text-xs tracking-widest uppercase text-stone mb-0.5">Paula</p>
                                    <p className="font-sans text-sm font-medium text-[var(--color-text)]">+41 78 927 94 74</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
