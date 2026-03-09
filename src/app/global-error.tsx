'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
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
                        Something went wrong
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
                        Reload page
                    </button>
                </div>
            </body>
        </html>
    )
}
