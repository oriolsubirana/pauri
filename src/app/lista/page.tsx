import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RsvpRow = {
    id: number
    name: string
    email: string
    attending: boolean
    adults_count: number
    kids_count: number
    dietary_restrictions: string | null
    staying_until_night: boolean | null
    song_request: string | null
    comments: string | null
    created_at: string
}

async function getRsvps(): Promise<RsvpRow[]> {
    const { data, error } = await supabaseAdmin
        .from('rsvps')
        .select('id, name, email, attending, adults_count, kids_count, dietary_restrictions, staying_until_night, song_request, comments, created_at')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching RSVPs:', error)
        return []
    }

    return (data ?? []) as RsvpRow[]
}

export default async function DashboardPage() {
    const rsvps = await getRsvps()
    const confirmed = rsvps.filter(r => r.attending)
    const declined = rsvps.filter(r => !r.attending)
    const totalAdults = confirmed.reduce((sum, r) => sum + (r.adults_count ?? 0), 0)
    const totalKids = confirmed.reduce((sum, r) => sum + (r.kids_count ?? 0), 0)

    return (
        <div style={{ fontFamily: 'Georgia, serif', background: '#F6F2EC', minHeight: '100vh', padding: '32px 16px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ color: '#5E6B3C', fontSize: '24px', margin: '0 0 4px' }}>
                            Lista de invitados · Oriol &amp; Paula
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                            19 de septiembre de 2026 · Mas Corbella, Alcover
                        </p>
                    </div>
                    <form action="/api/lista/logout" method="POST">
                        <button
                            type="submit"
                            style={{
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontFamily: 'Georgia, serif',
                                fontSize: '14px',
                                cursor: 'pointer',
                                color: '#6b7280',
                            }}
                        >
                            Cerrar sesión
                        </button>
                    </form>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginBottom: '40px',
                }}>
                    <StatCard label="Confirmados" value={confirmed.length} unit="personas" color="#5E6B3C" />
                    <StatCard label="Adultos totales" value={totalAdults} color="#5E6B3C" />
                    <StatCard label="Niños totales" value={totalKids} color="#5E6B3C" />
                    <StatCard label="No asistirán" value={declined.length} color="#C4714A" />
                </div>

                {/* Confirmed table */}
                <Section title={`Confirmados (${confirmed.length})`} color="#5E6B3C">
                    {confirmed.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Sin confirmaciones todavía.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#5E6B3C', color: '#fff' }}>
                                        <Th>Nombre</Th>
                                        <Th>Email</Th>
                                        <Th center>Adultos</Th>
                                        <Th center>Niños</Th>
                                        <Th>Restricciones</Th>
                                        <Th center>Hasta 22h</Th>
                                        <Th>Petición canción</Th>
                                        <Th>Comentarios</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {confirmed.map((r, i) => (
                                        <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f7f3' }}>
                                            <Td>{r.name}</Td>
                                            <Td>{r.email}</Td>
                                            <Td center>{r.adults_count ?? 1}</Td>
                                            <Td center>{r.kids_count ?? 0}</Td>
                                            <Td>{r.dietary_restrictions ?? '—'}</Td>
                                            <Td center>
                                                {r.staying_until_night === true ? 'Sí' : r.staying_until_night === false ? 'No' : '—'}
                                            </Td>
                                            <Td>{r.song_request ?? '—'}</Td>
                                            <Td truncate>{r.comments ?? '—'}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Section>

                {/* Declined table */}
                <Section title={`No asistirán (${declined.length})`} color="#C4714A">
                    {declined.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Ninguna respuesta negativa todavía.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#C4714A', color: '#fff' }}>
                                        <Th>Nombre</Th>
                                        <Th>Email</Th>
                                        <Th>Comentarios</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {declined.map((r, i) => (
                                        <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f7f3' }}>
                                            <Td>{r.name}</Td>
                                            <Td>{r.email}</Td>
                                            <Td>{r.comments ?? '—'}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Section>

            </div>
        </div>
    )
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit?: string; color: string }) {
    return (
        <div style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 6px' }}>{label}</p>
            <p style={{ color, fontSize: '32px', fontWeight: 700, margin: 0, lineHeight: 1 }}>
                {value}
                {unit && <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: '6px', color: '#9ca3af' }}>{unit}</span>}
            </p>
        </div>
    )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            marginBottom: '28px',
            overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede6' }}>
                <h2 style={{ color, fontSize: '16px', margin: 0 }}>{title}</h2>
            </div>
            {children}
        </div>
    )
}

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
    return (
        <th style={{
            padding: '8px 12px',
            textAlign: center ? 'center' : 'left',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        }}>
            {children}
        </th>
    )
}

function Td({ children, center, truncate }: { children: React.ReactNode; center?: boolean; truncate?: boolean }) {
    return (
        <td
            title={truncate && typeof children === 'string' ? children : undefined}
            style={{
                padding: '8px 12px',
                borderBottom: '1px solid #f0ede6',
                textAlign: center ? 'center' : 'left',
                color: '#374151',
                maxWidth: truncate ? '160px' : undefined,
                whiteSpace: truncate ? 'nowrap' : undefined,
                overflow: truncate ? 'hidden' : undefined,
                textOverflow: truncate ? 'ellipsis' : undefined,
            }}
        >
            {children}
        </td>
    )
}
