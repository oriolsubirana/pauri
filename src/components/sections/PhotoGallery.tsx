'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'
import { ImageIcon, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

type Props = {
    dict: Dictionary
    photos: string[]
    photosUrl: string | null
}

export function PhotoGallery({ dict, photos, photosUrl }: Props) {
    const ref = useScrollFadeIn()
    const [lightbox, setLightbox] = useState<number | null>(null)
    const [currentFrame, setCurrentFrame] = useState(0)

    // Auto-playing sequence (GIF effect)
    useEffect(() => {
        if (photos.length <= 1) return
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % photos.length)
        }, 500) // 350ms per frame for a medium-fast sequence
        return () => clearInterval(interval)
    }, [photos.length])

    // Keyboard navigation
    useEffect(() => {
        if (lightbox === null) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightbox(null)
            if (e.key === 'ArrowRight') setLightbox((i) => (i !== null ? Math.min(i + 1, photos.length - 1) : null))
            if (e.key === 'ArrowLeft') setLightbox((i) => (i !== null ? Math.max(i - 1, 0) : null))
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [lightbox, photos.length])

    return (
        <section id="photos" className="section-spacing">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-10">
                        <h2 className="section-title">{dict.photos.title}</h2>
                        <span className="ornament mt-4 mb-6" />
                        <p className="section-subtitle max-w-md mx-auto mb-8">{dict.photos.subtitle}</p>
                    </div>

                    {photos.length > 0 ? (
                        <>
                            {/* Animated Sequence (GIF Effect) */}
                            <div className="flex flex-col items-center justify-center mb-12">
                                <div
                                    className="relative w-full max-w-lg aspect-[4/5] sm:aspect-square bg-white p-3 pb-12 sm:p-4 sm:pb-16 rounded-sm shadow-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                    onClick={() => setLightbox(currentFrame)}
                                >
                                    <div className="relative w-full h-full overflow-hidden bg-sand-light">
                                        {photos.map((src, i) => (
                                            <Image
                                                key={src}
                                                src={src}
                                                alt={`Foto ${i + 1}`}
                                                fill
                                                className={`object-cover transition-opacity duration-[200ms] ${i === currentFrame ? 'opacity-100' : 'opacity-0'}`}
                                                sizes="(max-width: 640px) 100vw, 512px"
                                                priority={i === 0}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Google Photos link */}
                            {photosUrl && (
                                <div className="text-center">
                                    <a
                                        href={photosUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary inline-flex items-center gap-2"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        {dict.photos.cta}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty state — no photos yet */
                        <div className="text-center">
                            {photosUrl ? (
                                <a
                                    href={photosUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary inline-flex items-center gap-2"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    {dict.photos.cta}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            ) : (
                                <div className="inline-flex items-center gap-2 btn-secondary opacity-50 cursor-not-allowed">
                                    <ImageIcon className="w-4 h-4" />
                                    {dict.photos.cta}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    {/* Close */}
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
                        aria-label="Tancar"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Prev */}
                    {lightbox > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}
                            className="absolute left-4 text-white/70 hover:text-white transition-colors p-2"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    {/* Image */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={photos[lightbox]}
                            alt={`Foto ${lightbox + 1}`}
                            width={1200}
                            height={800}
                            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-xl"
                            sizes="90vw"
                        />
                    </div>

                    {/* Next */}
                    {lightbox < photos.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}
                            className="absolute right-4 text-white/70 hover:text-white transition-colors p-2"
                            aria-label="Següent"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-sans text-xs">
                        {lightbox + 1} / {photos.length}
                    </div>
                </div>
            )}
        </section>
    )
}
