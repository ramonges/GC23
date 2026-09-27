import SiteHeader from '@/components/vulcan/SiteHeader'
import Hero from '@/components/vulcan/Hero'
import ProblemSection from '@/components/vulcan/ProblemSection'
import OriginsSection from '@/components/vulcan/OriginsSection'
import JourneySection from '@/components/vulcan/JourneySection'
import CredibilitySection from '@/components/vulcan/CredibilitySection'
import SiteFooter from '@/components/vulcan/SiteFooter'

export default function Home() {
  return (
    <div className="vulcan min-h-screen bg-vulcan-ink font-grotesk text-white antialiased selection:bg-vulcan-signal selection:text-white">
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSection />
        <OriginsSection />
        <JourneySection />
        <CredibilitySection />
      </main>
      <SiteFooter />
    </div>
  )
}
