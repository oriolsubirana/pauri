import fs from 'fs'
import path from 'path'
import type { Dictionary } from '@/dictionaries'
import { VenueSection } from './VenueSection'

const VENUE_DIR = path.join(process.cwd(), 'public', 'venue')
const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

function getVenuePhotos(): string[] {
    try {
        if (!fs.existsSync(VENUE_DIR)) return []
        return fs
            .readdirSync(VENUE_DIR)
            .filter((f) => ALLOWED.includes(path.extname(f).toLowerCase()))
            .sort()
            .map((f) => `/venue/${f}`)
    } catch {
        return []
    }
}

export function VenueSectionWrapper({ dict }: { dict: Dictionary }) {
    const photos = getVenuePhotos()
    return <VenueSection dict={dict} photos={photos} />
}
