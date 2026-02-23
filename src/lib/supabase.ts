import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

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
