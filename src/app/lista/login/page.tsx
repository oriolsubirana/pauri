'use client'

import { useState } from 'react'

export default function DashboardLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/lista/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                window.location.replace('/lista')
            } else {
                setError('Contraseña incorrecta')
            }
        } catch {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{ fontFamily: 'Georgia, serif', background: '#F6F2EC', minHeight: '100vh' }}
            className="flex items-center justify-center px-4"
        >
            <div
                style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                className="w-full max-w-sm p-6 sm:p-8"
            >
                <h1
                    style={{ color: '#5E6B3C', fontFamily: 'Georgia, serif' }}
                    className="text-xl sm:text-2xl font-semibold mb-6 text-center"
                >
                    Lista de invitados
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        required
                        autoFocus
                        style={{
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            fontFamily: 'Georgia, serif',
                            fontSize: '16px',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#5E6B3C')}
                        onBlur={e => (e.target.style.borderColor = '#d1d5db')}
                    />

                    {error && (
                        <p style={{ color: '#C4714A', fontSize: '14px' }} className="text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? '#8f9e6a' : '#5E6B3C',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            fontFamily: 'Georgia, serif',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            width: '100%',
                        }}
                    >
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
