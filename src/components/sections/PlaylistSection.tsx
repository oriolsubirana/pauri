'use client'

import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'

export function PlaylistSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()
    const playlistUrl = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL

    const embedUrl = playlistUrl
        ? playlistUrl.replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/')
        : null

    return (
        <section id="playlist" className="section-spacing bg-sand-light/40">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-10">
                        <h2 className="section-title">{dict.playlist.title}</h2>
                        <span className="ornament mt-4 mb-6" />
                        <p className="section-subtitle max-w-md mx-auto">{dict.playlist.subtitle}</p>
                    </div>

                    {embedUrl ? (
                        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
                            <div className="w-full rounded-2xl overflow-hidden shadow-soft-lg">
                                <iframe
                                    style={{ borderRadius: '16px' }}
                                    src={`${embedUrl}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="380"
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    title="Wedding Playlist"
                                />
                            </div>
                            {playlistUrl && (dict.playlist as any).cta && (
                                <a
                                    href={playlistUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-olive text-white font-sans text-sm font-medium rounded-2xl shadow-card hover:bg-olive-dark transition-colors"
                                >
                                    {(dict.playlist as any).cta}
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto rounded-2xl bg-sand border border-sand-dark flex items-center justify-center h-40 shadow-card">
                            <p className="font-sans text-sm text-stone italic">
                                Playlist coming soon ♪
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
