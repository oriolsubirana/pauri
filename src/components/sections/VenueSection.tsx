'use client'

import Image from 'next/image'
import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import { GOOGLE_MAPS_URL } from '@/lib/utils'
import type { Dictionary } from '@/dictionaries'
import { MapPin, Car, ExternalLink } from 'lucide-react'

type Props = {
    dict: Dictionary
    photos: string[]
}

export function VenueSection({ dict, photos }: Props) {
    const ref = useScrollFadeIn()
    const v = dict.venue

    const hasPhotos = photos.length > 0

    return (
        <section id="venue" className="section-spacing bg-sand-light/40">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-10">
                        <h2 className="section-title">{v.title}</h2>
                        <span className="ornament mt-4 mb-6" />
                        <p className="section-subtitle max-w-md mx-auto">{v.subtitle}</p>
                    </div>

                    {/* Photos */}
                    {hasPhotos && (
                        <div className="mb-10">
                            {photos.length === 1 ? (
                                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-soft-lg">
                                    <Image
                                        src={photos[0]}
                                        alt="Mas Corbella"
                                        width={1200}
                                        height={700}
                                        className="w-full h-auto object-cover"
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                                    <div className="rounded-2xl overflow-hidden shadow-soft-lg">
                                        <Image
                                            src={photos[0]}
                                            alt="Mas Corbella"
                                            width={800}
                                            height={600}
                                            className="w-full h-full object-cover aspect-[4/3]"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="rounded-2xl overflow-hidden shadow-soft-lg flex-1">
                                            <Image
                                                src={photos[1]}
                                                alt="Mas Corbella piscina"
                                                width={800}
                                                height={600}
                                                className="w-full h-full object-cover aspect-[4/3] md:aspect-auto md:h-full"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                        <a
                                            href={GOOGLE_MAPS_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-background rounded-2xl p-5 shadow-card border border-sand hover:border-olive/40 transition-all flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-olive/20 transition-colors">
                                                <MapPin className="w-4 h-4 text-olive" />
                                            </div>
                                            <div>
                                                <p className="font-serif text-base text-olive font-medium">Mas Corbella</p>
                                                <p className="font-sans text-xs text-stone mt-0.5">Alcover, Tarragona · {v.maps_cta}</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Extra photos */}
                            {photos.length > 2 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mt-3">
                                    {photos.slice(2).map((src, i) => (
                                        <div key={src} className="rounded-2xl overflow-hidden shadow-card">
                                            <Image
                                                src={src}
                                                alt={`Mas Corbella ${i + 3}`}
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-cover aspect-video"
                                                sizes="(max-width: 640px) 50vw, 33vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Getting there — distance cards */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Car className="w-4 h-4 text-olive flex-shrink-0" />
                            <h3 className="font-serif text-xl text-olive">{v.getting_there_title}</h3>
                            <span className="font-sans text-xs text-stone/60 ml-1">— {v.getting_there_note}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {v.origins.map((origin) => (
                                <a
                                    key={origin.city}
                                    href={origin.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-background rounded-2xl px-5 py-4 shadow-card border border-sand hover:border-olive/40 hover:shadow-soft transition-all"
                                >
                                    <p className="font-sans text-sm font-medium text-[var(--color-text)] group-hover:text-olive transition-colors mb-2">
                                        {origin.city}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-serif text-2xl text-olive">{origin.time.replace('~', '')}</span>
                                    </div>
                                    <p className="font-sans text-xs text-stone mt-1">{origin.km}</p>
                                    <div className="flex items-center gap-1 mt-3 text-xs text-stone/50 group-hover:text-olive/60 transition-colors">
                                        <span>Ruta →</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
