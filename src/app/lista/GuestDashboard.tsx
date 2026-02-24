'use client'

import { useState, useMemo } from 'react'

export type RsvpRow = {
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

type SortField = 'name' | 'people' | 'staying_until_night' | 'created_at'
type SortDir = 'asc' | 'desc'

function sortConfirmed(rows: RsvpRow[], field: SortField, dir: SortDir): RsvpRow[] {
    return [...rows].sort((a, b) => {
        let v = 0
        if (field === 'name') v = a.name.localeCompare(b.name)
        else if (field === 'people') v = ((a.adults_count ?? 0) + (a.kids_count ?? 0)) - ((b.adults_count ?? 0) + (b.kids_count ?? 0))
        else if (field === 'staying_until_night') {
            const va = a.staying_until_night === true ? 0 : a.staying_until_night === false ? 1 : 2
            const vb = b.staying_until_night === true ? 0 : b.staying_until_night === false ? 1 : 2
            v = va - vb
        }
        else if (field === 'created_at') v = a.created_at.localeCompare(b.created_at)
        return dir === 'asc' ? v : -v
    })
}

export default function GuestDashboard({ rsvps }: { rsvps: RsvpRow[] }) {
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('created_at')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const confirmed = useMemo(() => rsvps.filter(r => r.attending), [rsvps])
    const declined = useMemo(() => rsvps.filter(r => !r.attending), [rsvps])

    const totalAdults = confirmed.reduce((sum, r) => sum + (r.adults_count ?? 0), 0)
    const totalKids = confirmed.reduce((sum, r) => sum + (r.kids_count ?? 0), 0)

    const q = search.trim().toLowerCase()

    const filteredConfirmed = useMemo(() => {
        const filtered = q ? confirmed.filter(r =>
            r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
        ) : confirmed
        return sortConfirmed(filtered, sortField, sortDir)
    }, [confirmed, q, sortField, sortDir])

    const filteredDeclined = useMemo(() => {
        if (!q) return declined
        return declined.filter(r =>
            r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
        )
    }, [declined, q])

    function toggleSort(field: SortField) {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortField(field); setSortDir('asc') }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: '4px' }}>↕</span>
        return <span style={{ color: '#5E6B3C', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
    }

    const thBase: React.CSSProperties = {
        padding: '10px 16px', fontWeight: 600, fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280',
        userSelect: 'none',
    }
    const thBtn: React.CSSProperties = { ...thBase, cursor: 'pointer', textAlign: 'left' }

    return (
        <div style={{ fontFamily: 'Georgia, serif', background: '#F6F2EC', minHeight: '100vh' }} className="px-4 py-6 sm:px-6 sm:py-8">
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 style={{ color: '#5E6B3C' }} className="text-lg sm:text-2xl font-semibold m-0">
                            Lista de invitados · Oriol &amp; Paula
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                            19 de septiembre de 2026 · Mas Corbella, Alcover
                        </p>
                    </div>
                    <form action="/api/lista/logout" method="POST" className="self-start sm:self-auto">
                        <button type="submit" style={{
                            background: 'transparent', border: '1px solid #d1d5db',
                            borderRadius: '8px', padding: '8px 16px', fontFamily: 'Georgia, serif',
                            fontSize: '14px', cursor: 'pointer', color: '#6b7280', whiteSpace: 'nowrap',
                        }}>
                            Cerrar sesión
                        </button>
                    </form>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <StatCard label="Confirmados" value={confirmed.length} unit="personas" color="#5E6B3C" />
                    <StatCard label="Adultos" value={totalAdults} color="#5E6B3C" />
                    <StatCard label="Niños" value={totalKids} color="#5E6B3C" />
                    <StatCard label="No asistirán" value={declined.length} color="#C4714A" />
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email…"
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            border: '1px solid #d1d5db', borderRadius: '8px',
                            padding: '10px 14px', fontFamily: 'Georgia, serif',
                            fontSize: '14px', outline: 'none', background: '#fff',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#5E6B3C')}
                        onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                    />
                </div>

                {/* Confirmed */}
                <Section
                    title={`Confirmados (${q ? `${filteredConfirmed.length} de ` : ''}${confirmed.length})`}
                    color="#5E6B3C"
                >
                    {confirmed.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Sin confirmaciones todavía.</p>
                    ) : filteredConfirmed.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Ningún resultado para &ldquo;{search}&rdquo;.</p>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="block md:hidden divide-y divide-[#f0ede6]">
                                {filteredConfirmed.map(r => (
                                    <div key={r.id} className="p-4 space-y-1">
                                        <p style={{ fontWeight: 600, color: '#374151', fontSize: '14px', margin: 0 }}>{r.name}</p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{r.email}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                                            <span style={{ fontSize: '12px', color: '#374151' }}>👤 {r.adults_count ?? 1} adulto{(r.adults_count ?? 1) !== 1 ? 's' : ''}</span>
                                            {(r.kids_count ?? 0) > 0 && (
                                                <span style={{ fontSize: '12px', color: '#374151' }}>🧒 {r.kids_count} niño{(r.kids_count ?? 0) !== 1 ? 's' : ''}</span>
                                            )}
                                            {r.staying_until_night !== null && (
                                                <span style={{ fontSize: '12px', color: '#374151' }}>🕙 Hasta 22h: {r.staying_until_night ? 'Sí' : 'No'}</span>
                                            )}
                                        </div>
                                        {r.dietary_restrictions && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>🥗 {r.dietary_restrictions}</p>}
                                        {r.song_request && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>🎵 {r.song_request}</p>}
                                        {r.comments && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>💬 {r.comments}</p>}
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9f7f3', borderBottom: '2px solid #5E6B3C' }}>
                                            <th style={thBtn} onClick={() => toggleSort('name')}>
                                                Invitado <SortIcon field="name" />
                                            </th>
                                            <th style={thBtn} onClick={() => toggleSort('people')}>
                                                Asistentes <SortIcon field="people" />
                                            </th>
                                            <th style={{ ...thBase, textAlign: 'left' }}>Restricciones</th>
                                            <th style={thBtn} onClick={() => toggleSort('staying_until_night')}>
                                                Hasta 22h <SortIcon field="staying_until_night" />
                                            </th>
                                            <th style={{ ...thBase, textAlign: 'left' }}>Canción</th>
                                            <th style={{ ...thBase, textAlign: 'left' }}>Comentarios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredConfirmed.map(r => (
                                            <tr key={r.id} className="border-b border-[#f0ede6] hover:bg-[#f6f4ef] transition-colors">
                                                <td style={{ padding: '12px 16px' }}>
                                                    <p style={{ fontWeight: 600, color: '#1f2937', margin: 0, fontSize: '13px' }}>{r.name}</p>
                                                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px', marginTop: '2px' }}>{r.email}</p>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span style={{ background: '#eef1e8', color: '#5E6B3C', borderRadius: '99px', padding: '2px 8px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                            {r.adults_count ?? 1} adulto{(r.adults_count ?? 1) !== 1 ? 's' : ''}
                                                        </span>
                                                        {(r.kids_count ?? 0) > 0 && (
                                                            <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '99px', padding: '2px 8px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                                {r.kids_count} niño{(r.kids_count ?? 0) !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {r.dietary_restrictions
                                                        ? <span style={{ background: '#fef9ec', color: '#92400e', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', border: '1px solid #fde68a' }}>{r.dietary_restrictions}</span>
                                                        : <span style={{ color: '#d1d5db' }}>—</span>
                                                    }
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    {r.staying_until_night === true
                                                        ? <span style={{ background: '#eef1e8', color: '#5E6B3C', borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 500 }}>Sí</span>
                                                        : r.staying_until_night === false
                                                            ? <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 500 }}>No</span>
                                                            : <span style={{ color: '#d1d5db' }}>—</span>
                                                    }
                                                </td>
                                                <TdTruncate>{r.song_request}</TdTruncate>
                                                <TdTruncate>{r.comments}</TdTruncate>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Section>

                {/* Declined */}
                <Section
                    title={`No asistirán (${q ? `${filteredDeclined.length} de ` : ''}${declined.length})`}
                    color="#C4714A"
                >
                    {declined.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Ninguna respuesta negativa todavía.</p>
                    ) : filteredDeclined.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: '16px' }}>Ningún resultado para &ldquo;{search}&rdquo;.</p>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="block md:hidden divide-y divide-[#f0ede6]">
                                {filteredDeclined.map(r => (
                                    <div key={r.id} className="p-4 space-y-1">
                                        <p style={{ fontWeight: 600, color: '#374151', fontSize: '14px', margin: 0 }}>{r.name}</p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{r.email}</p>
                                        {r.comments && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>💬 {r.comments}</p>}
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#fdf5f2', borderBottom: '2px solid #C4714A' }}>
                                            <th style={{ ...thBtn, width: '40%' }} onClick={() => toggleSort('name')}>
                                                Invitado <SortIcon field="name" />
                                            </th>
                                            <th style={{ ...thBase, textAlign: 'left' }}>Comentarios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDeclined.map(r => (
                                            <tr key={r.id} className="border-b border-[#f0ede6] hover:bg-[#fdf5f2] transition-colors">
                                                <td style={{ padding: '12px 16px' }}>
                                                    <p style={{ fontWeight: 600, color: '#1f2937', margin: 0, fontSize: '13px' }}>{r.name}</p>
                                                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px', marginTop: '2px' }}>{r.email}</p>
                                                </td>
                                                <TdTruncate>{r.comments}</TdTruncate>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Section>

            </div>
        </div>
    )
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit?: string; color: string }) {
    return (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px' }}>{label}</p>
            <p style={{ color, fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1 }}>
                {value}
                {unit && <span style={{ fontSize: '13px', fontWeight: 400, marginLeft: '5px', color: '#9ca3af' }}>{unit}</span>}
            </p>
        </div>
    )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede6' }}>
                <h2 style={{ color, fontSize: '15px', margin: 0 }}>{title}</h2>
            </div>
            {children}
        </div>
    )
}

function TdTruncate({ children }: { children: string | null | undefined }) {
    const text = children ?? null
    return (
        <td title={text ?? undefined} style={{
            padding: '12px 16px', color: text ? '#6b7280' : '#d1d5db',
            fontStyle: text ? 'italic' : 'normal', maxWidth: '200px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px',
        }}>
            {text ?? '—'}
        </td>
    )
}
