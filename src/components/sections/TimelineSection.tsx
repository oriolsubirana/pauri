'use client'

import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'

export function TimelineSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()

    return (
        <section id="timeline" className="section-spacing">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-14">
                        <h2 className="section-title">{dict.timeline.title}</h2>
                        <span className="ornament mt-4" />
                    </div>

                    <div className="max-w-lg mx-auto">
                        {dict.timeline.items.map((item, i) => (
                            <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                                {/* Vertical line */}
                                {i < dict.timeline.items.length - 1 && (
                                    <div className="absolute left-[27px] top-8 bottom-0 w-px bg-gradient-to-b from-sand-dark to-transparent" />
                                )}

                                {/* Circle */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-sand border-2 border-sand-dark flex items-center justify-center shadow-card">
                                        <span className="font-sans text-xs font-medium text-stone leading-tight text-center">
                                            {item.time}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-3">
                                    <h3 className="font-serif text-lg text-olive mb-1">{item.title}</h3>
                                    <p className="font-sans text-sm text-stone font-light">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
