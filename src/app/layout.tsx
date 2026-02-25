import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Paula & Oriol — 19 Setembre 2026',
    description: 'Una celebració amb amics. 19 de setembre de 2026.',
    icons: {
        icon: '/favicon.png.bak',
        apple: '/favicon.png.bak',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ca">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-background antialiased">{children}</body>
        </html>
    )
}
