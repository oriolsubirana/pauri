'use client'

import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'
import { BedDouble, Bus, ExternalLink, MapPin } from 'lucide-react'
import { TransferMap } from './TransferMap'

export function AccommodationSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()
    const a = dict.accommodation

    return (
        <section id="accommodation" className="section-spacing">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-10">
                        <h2 className="section-title">{a.title}</h2>
                        <span className="ornament mt-4 mb-6" />
                        <p className="section-subtitle max-w-md mx-auto">{a.subtitle}</p>
                    </div>

                    {/* Hotels */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <BedDouble className="w-4 h-4 text-olive flex-shrink-0" />
                            <h3 className="font-serif text-xl text-olive">{a.hotels_title}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {a.hotels.map((hotel) => (
                                <a
                                    key={hotel.url}
                                    href={hotel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-background rounded-2xl px-5 py-4 shadow-card border border-sand hover:border-olive/40 hover:shadow-soft transition-all"
                                >
                                    <p className="font-serif text-lg text-olive group-hover:text-olive-dark transition-colors mb-1">
                                        {hotel.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-stone">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <p className="font-sans text-xs">{hotel.location}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3 text-xs text-stone/50 group-hover:text-olive/60 transition-colors">
                                        <span>{a.hotel_cta}</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Transfer */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Bus className="w-4 h-4 text-olive flex-shrink-0" />
                            <h3 className="font-serif text-xl text-olive">{a.transfer_title}</h3>
                        </div>

                        <div className="bg-background rounded-2xl p-6 md:p-8 shadow-card border border-sand">
                            <p className="font-sans text-sm text-stone mb-6">{a.transfer_subtitle}</p>

                            <div className="mb-8">
                                <TransferMap dict={dict} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4 bg-sand-light/60 rounded-2xl p-5">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
                                        <Bus className="w-4 h-4 text-olive" />
                                    </div>
                                    <div>
                                        <p className="font-sans text-xs tracking-widest uppercase text-stone mb-1">
                                            {a.transfer_departure_label}
                                        </p>
                                        <p className="font-serif text-2xl text-olive leading-none mb-1.5">
                                            {a.transfer_departure_time}
                                        </p>
                                        <p className="font-sans text-xs text-stone">
                                            {a.transfer_departure_desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 bg-sand-light/60 rounded-2xl p-5">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
                                        <Bus className="w-4 h-4 text-olive" />
                                    </div>
                                    <div>
                                        <p className="font-sans text-xs tracking-widest uppercase text-stone mb-1">
                                            {a.transfer_return_label}
                                        </p>
                                        <p className="font-serif text-2xl text-olive leading-none mb-1.5">
                                            {a.transfer_return_time}
                                        </p>
                                        <p className="font-sans text-xs text-stone">
                                            {a.transfer_return_desc}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="font-sans text-xs text-stone/70 mt-5 italic">{a.transfer_note}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
