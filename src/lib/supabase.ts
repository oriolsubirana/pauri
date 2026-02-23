import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
