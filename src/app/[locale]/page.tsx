import { getDictionary, type Locale } from '@/dictionaries'
import { HeroSection } from '@/components/sections/HeroSection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { VenueSectionWrapper } from '@/components/sections/VenueSectionWrapper'
import { AccommodationSection } from '@/components/sections/AccommodationSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { PlaylistSection } from '@/components/sections/PlaylistSection'
import { PhotosSection } from '@/components/sections/PhotosSection'
import { CountdownSection } from '@/components/sections/CountdownSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { ContactSection } from '@/components/sections/ContactSection'

// Force server-rendering on every request to avoid stale pre-rendered HTML
// that references old JS/CSS chunks after a new Netlify deploy.
export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <>
            <HeroSection dict={dict} locale={locale as Locale} />
            <EventInfoSection dict={dict} />
            <VenueSectionWrapper dict={dict} />
            <AccommodationSection dict={dict} />
            <TimelineSection dict={dict} />
            <PlaylistSection dict={dict} />
            <PhotosSection dict={dict} />
            <CountdownSection dict={dict} />
            <FAQSection dict={dict} />
            <ContactSection dict={dict} />
        </>
    )
}
