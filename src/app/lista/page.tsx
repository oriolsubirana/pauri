import { supabaseAdmin } from '@/lib/supabase-admin'
import GuestDashboard from './GuestDashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const { data, error } = await supabaseAdmin
        .from('rsvps')
        .select('id, name, email, attending, adults_count, kids_count, dietary_restrictions, staying_until_night, song_request, comments, created_at')
        .order('created_at', { ascending: true })

    if (error) console.error('Error fetching RSVPs:', error)

    return <GuestDashboard rsvps={data ?? []} />
}
