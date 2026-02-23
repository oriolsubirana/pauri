import fs from 'fs'
import path from 'path'
import type { Dictionary } from '@/dictionaries'
import { PhotoGallery } from './PhotoGallery'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

function getPhotos(): string[] {
    try {
        if (!fs.existsSync(PHOTOS_DIR)) return []
        return fs
            .readdirSync(PHOTOS_DIR)
            .filter((f) => ALLOWED_EXTENSIONS.includes(path.extname(f).toLowerCase()))
            .sort()
            .map((f) => `/photos/${f}`)
    } catch {
        return []
    }
}

export function PhotosSection({ dict }: { dict: Dictionary }) {
    const photos = getPhotos()
    const photosUrl = process.env.NEXT_PUBLIC_GOOGLE_PHOTOS_URL

    return <PhotoGallery dict={dict} photos={photos} photosUrl={photosUrl ?? null} />
}
