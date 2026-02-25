import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Paula & Oriol'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    try {
        const fontUrl = 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTbtbK-F2qO0g.ttf'
        const res = await fetch(fontUrl)
        if (!res.ok) throw new Error('Failed to fetch font')
        const fontData = await res.arrayBuffer()

        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#F6F2EC',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 350,
                            color: '#5E6B3C',
                            fontFamily: '"Playfair Display"',
                            lineHeight: 1,
                        }}
                    >
                        P&O
                    </div>
                    <div
                        style={{
                            fontSize: 60,
                            color: '#C4714A',
                            fontFamily: '"Playfair Display"',
                            marginTop: 40,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        19 de Septiembre de 2026
                    </div>
                </div>
            ),
            {
                ...size,
                fonts: [
                    {
                        name: 'Playfair Display',
                        data: fontData,
                        style: 'italic',
                        weight: 500,
                    },
                ],
            }
        )
    } catch (e) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#F6F2EC',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 350,
                            color: '#5E6B3C',
                            lineHeight: 1,
                        }}
                    >
                        P&O
                    </div>
                </div>
            ),
            { ...size }
        )
    }
}
