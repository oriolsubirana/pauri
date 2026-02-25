import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default async function Icon() {
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
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 250,
                            color: '#5E6B3C',
                            fontFamily: '"Playfair Display"',
                            lineHeight: 1,
                            marginTop: 10,
                            marginLeft: 15,
                        }}
                    >
                        P&O
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 250,
                        color: '#5E6B3C',
                        lineHeight: 1,
                        marginTop: 10,
                        marginLeft: 15,
                    }}
                >
                    P&O
                </div>
            ),
            { ...size }
        )
    }
}
