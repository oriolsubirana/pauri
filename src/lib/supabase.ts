import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
        _supabase = createClient(supabaseUrl, supabaseAnonKey)
    }
    return _supabase
}

// Keep backward compat — lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabase() as any)[prop]
    },
})

export type RsvpInsert = {
    name: string
    email: string
    attending: boolean
    guests_count: number
    dietary_restrictions?: string
    staying_until_night?: boolean | null
    song_request?: string
    comments?: string
}
