'use client'

import { useState, useEffect } from 'react'
import { useScrollFadeIn } from '@/lib/useScrollFadeIn'
import { EVENT_DATE, formatCountdown } from '@/lib/utils'
import type { Dictionary } from '@/dictionaries'

export function CountdownSection({ dict }: { dict: Dictionary }) {
    const ref = useScrollFadeIn()
    const c = dict.countdown

    const [timeLeft, setTimeLeft] = useState(() =>
        formatCountdown(EVENT_DATE.getTime() - Date.now())
    )
    const [isPast, setIsPast] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const ms = EVENT_DATE.getTime() - Date.now()
        if (ms < 0) { setIsPast(true); return }

        setTimeLeft(formatCountdown(ms))

        const interval = setInterval(() => {
            const remaining = EVENT_DATE.getTime() - Date.now()
            if (remaining <= 0) {
                setIsPast(true)
                clearInterval(interval)
                return
            }
            setTimeLeft(formatCountdown(remaining))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const units = [
        { value: timeLeft.days, label: c.days },
        { value: timeLeft.hours, label: c.hours },
        { value: timeLeft.minutes, label: c.minutes },
        { value: timeLeft.seconds, label: c.seconds },
    ]

    return (
        <section id="countdown" className="section-spacing bg-olive text-sand-light">
            <div className="container-main">
                <div ref={ref} className="fade-in-section text-center">
                    <h2 className="font-serif text-3xl md:text-4xl text-sand font-medium mb-10">
                        {isPast ? c.past : c.title}
                    </h2>

                    {!isPast && mounted && (
                        <div className="flex justify-center gap-2 sm:gap-6 md:gap-8">
                            {units.map(({ value, label }) => (
                                <div key={label} className="flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
                                    <span
                                        key={`${label}-${value}`}
                                        className="font-serif text-3xl sm:text-4xl md:text-6xl text-sand tabular-nums leading-none animate-[countdownTick_0.3s_ease-out]"
                                    >
                                        {String(value).padStart(2, '0')}
                                    </span>
                                    <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-sand/60 mt-2">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
