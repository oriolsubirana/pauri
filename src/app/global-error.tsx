'use client'

import { useEffect, useMemo } from 'react'

const errorMessages: Record<string, { title: string; button: string }> = {
    ca: { title: 'Alguna cosa ha anat malament', button: 'Recarregar pàgina' },
    es: { title: 'Algo ha salido mal', button: 'Recargar página' },
    en: { title: 'Something went wrong', button: 'Reload page' },
}

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const messages = useMemo(() => {
        const locale = window.location.pathname.split('/')[1] || 'ca'
        return errorMessages[locale] ?? errorMessages.ca
    }, [])

    useEffect(() => {
        // Auto-recover from ChunkLoadError by doing a hard reload
        // This happens when Netlify serves stale HTML referencing old JS chunks
        if (
            error.message?.includes('ChunkLoadError') ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Failed to fetch dynamically imported module')
        ) {
            window.location.reload()
            return
        }
    }, [error])

    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        {messages.title}
                    </h2>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#5E6B3C',
                            color: 'white',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                        }}
                    >
                        {messages.button}
                    </button>
                </div>
            </body>
        </html>
    )
}
