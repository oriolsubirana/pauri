'use client'

import { useEffect, useRef } from 'react'

export function useScrollFadeIn() {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible')
                    observer.unobserve(entry.target)
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        )

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return ref
}
