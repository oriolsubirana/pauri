'use client'

import { useState } from 'react'
import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import type { Dictionary } from '@/dictionaries'
import { ChevronDown } from 'lucide-react'

type FAQItemProps = {
    q: string
    a: string
}

function FAQItem({ q, a }: FAQItemProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-sand-dark last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span className="font-sans text-sm font-medium text-[var(--color-text)] group-hover:text-olive transition-colors pr-4">
                    {q}
                </span>
                <ChevronDown
                    className={`flex-shrink-0 w-4 h-4 text-stone transition-transform duration-200 ${open ? 'rotate-180 text-olive' : ''}`}
                />
            </button>
            {open && (
                <p className="font-sans text-sm text-stone font-light pb-5 pr-6 leading-relaxed">
                    {a}
                </p>
            )}
        </div>
    )
}

export function FAQSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()

    return (
        <section id="faq" className="section-spacing">
            <div className="container-main">
                <div ref={ref} className="fade-in-section">
                    <div className="text-center mb-14">
                        <h2 className="section-title">{dict.faq.title}</h2>
                        <span className="ornament mt-4" />
                    </div>

                    <div className="max-w-2xl mx-auto bg-background rounded-2xl shadow-soft px-6 md:px-8">
                        {dict.faq.items.map((item, i) => (
                            <FAQItem key={i} q={item.q} a={item.a} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
