'use client'

import { useState } from 'react'
import type { Dictionary, Locale } from '@/dictionaries'
import { CheckCircle } from 'lucide-react'

type FormState = {
    name: string
    email: string
    attending: 'yes' | 'no' | ''
    adults_count: string
    kids_count: string
    dietary_restrictions: string
    staying_until_night: 'yes' | 'no' | ''
    comments: string
}

type Props = {
    dict: Dictionary
    locale: Locale
}

export function RSVPForm({ dict }: Props) {
    const r = dict.rsvp
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        attending: '',
        adults_count: '1',
        kids_count: '0',
        dietary_restrictions: '',
        staying_until_night: '',
        comments: '',
    })
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const set = (key: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

    const validate = () => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.name.trim()) newErrors.name = r.validation_name
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = r.validation_email
        if (!form.attending) newErrors.attending = r.validation_attending
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setSubmitting(true)
        setServerError(null)
        try {
            const res = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    attending: form.attending === 'yes',
                    adults_count: parseInt(form.adults_count) || 1,
                    kids_count: parseInt(form.kids_count) || 0,
                    dietary_restrictions: form.dietary_restrictions || null,
                    staying_until_night:
                        form.staying_until_night === 'yes'
                            ? true
                            : form.staying_until_night === 'no'
                                ? false
                                : null,
                    song_request: null,
                    comments: form.comments || null,
                }),
            })
            if (!res.ok) throw new Error('Server error')
            setSuccess(true)
        } catch {
            setServerError(r.error)
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-olive" />
                </div>
                <h3 className="font-serif text-2xl text-olive">{r.success_title}</h3>
                <p className="font-sans text-sm text-stone max-w-sm">{r.success_message}</p>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Name */}
            <div>
                <label className="label">{r.name_label}</label>
                <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder={r.name_placeholder}
                    className="input-field"
                />
                {errors.name && <p className="text-terracotta text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="label">{r.email_label}</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder={r.email_placeholder}
                    className="input-field"
                />
                {errors.email && <p className="text-terracotta text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Attending */}
            <div>
                <label className="label">{r.attending_label}</label>
                <div className="flex gap-3">
                    {(['yes', 'no'] as const).map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => set('attending', val)}
                            className={`flex-1 py-3 px-4 rounded-xl border transition-all text-sm font-sans ${form.attending === val && val === 'yes'
                                ? 'border-olive bg-olive text-sand-light'
                                : form.attending === val && val === 'no'
                                    ? 'border-terracotta bg-terracotta/10 text-terracotta'
                                    : 'border-sand-dark bg-white text-stone hover:border-olive/60'
                                }`}
                        >
                            {val === 'yes' ? r.attending_yes : r.attending_no}
                        </button>
                    ))}
                </div>
                {errors.attending && (
                    <p className="text-terracotta text-xs mt-1">{errors.attending}</p>
                )}
            </div>

            {form.attending === 'yes' && (
                <>
                    {/* Adults + Kids count */}
                    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
                        <div>
                            <label className="label">{r.adults_label}</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={form.adults_count}
                                onChange={(e) => set('adults_count', e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">{r.kids_label}</label>
                            <input
                                type="number"
                                min={0}
                                max={20}
                                value={form.kids_count}
                                onChange={(e) => set('kids_count', e.target.value)}
                                placeholder={r.kids_placeholder}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Dietary */}
                    <div>
                        <label className="label">{r.dietary_label}</label>
                        <input
                            value={form.dietary_restrictions}
                            onChange={(e) => set('dietary_restrictions', e.target.value)}
                            placeholder={r.dietary_placeholder}
                            className="input-field"
                        />
                    </div>

                    {/* Staying */}
                    <div>
                        <label className="label">{r.staying_label}</label>
                        <div className="flex gap-3">
                            {(['yes', 'no'] as const).map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => set('staying_until_night', val)}
                                    className={`flex-1 py-3 rounded-xl border transition-all text-sm font-sans ${form.staying_until_night === val
                                        ? 'border-olive bg-olive text-sand-light'
                                        : 'border-sand-dark bg-white text-stone hover:border-olive/60'
                                        }`}
                                >
                                    {val === 'yes' ? r.staying_yes : r.staying_no}
                                </button>
                            ))}
                        </div>
                    </div>

                </>
            )}

            {/* Comments */}
            <div>
                <label className="label">{r.comments_label}</label>
                <textarea
                    value={form.comments}
                    onChange={(e) => set('comments', e.target.value)}
                    placeholder={r.comments_placeholder}
                    rows={3}
                    className="input-field resize-none"
                />
            </div>

            {serverError && <p className="text-terracotta text-sm text-center">{serverError}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-60"
            >
                {submitting ? r.submitting : r.submit}
            </button>
        </form>
    )
}
