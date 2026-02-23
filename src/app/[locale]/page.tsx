import { getDictionary, type Locale } from '@/dictionaries'
import { HeroSection } from '@/components/sections/HeroSection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { VenueSectionWrapper } from '@/components/sections/VenueSectionWrapper'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { PlaylistSection } from '@/components/sections/PlaylistSection'
import { PhotosSection } from '@/components/sections/PhotosSection'
import { CountdownSection } from '@/components/sections/CountdownSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { ContactSection } from '@/components/sections/ContactSection'

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
            <TimelineSection dict={dict} />
            <PlaylistSection dict={dict} />
            <PhotosSection dict={dict} />
            <CountdownSection dict={dict} />
            <FAQSection dict={dict} />
            <ContactSection dict={dict} />
        </>
    )
}
