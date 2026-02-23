'use client'

import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import { GOOGLE_MAPS_URL } from '@/lib/utils'
import type { Dictionary } from '@/dictionaries'
import { MapPin, Clock, CalendarDays, UtensilsCrossed } from 'lucide-react'

export function EventInfoSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()
    const e = dict.event

    const details = [
        { icon: CalendarDays, label: e.date_label, value: e.date },
        { icon: Clock, label: e.time_label, value: e.time },
        { icon: UtensilsCrossed, label: e.type_label, value: e.type },
        {
            icon: MapPin,
            label: e.location_label,
            value: (
                <span className="flex flex-col gap-1">
                    <span>{e.location_name}</span>
                    <a
                        href={GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-olive text-xs underline underline-offset-4 hover:text-olive-dark transition-colors"
                    >
                        {e.location_cta} ↗
                    </a>
                </span>
            ),
        },
    ]

    return (
        <section id="event" className="section-spacing bg-sand-light/50">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-14">
                        <h2 className="section-title">{e.title}</h2>
                        <span className="ornament mt-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {details.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-start gap-4 bg-background rounded-2xl p-6 shadow-card"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-olive" />
                                </div>
                                <div>
                                    <p className="font-sans text-xs tracking-widest uppercase text-stone mb-1">{label}</p>
                                    <p className="font-sans text-sm text-[var(--color-text)] font-medium">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
