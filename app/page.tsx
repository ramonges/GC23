import SiteHeader from '@/components/vulcan/SiteHeader'
import CinematicExperience from '@/components/vulcan/cinematic/CinematicExperience'
import ProblemSection from '@/components/vulcan/ProblemSection'
import OriginsSection from '@/components/vulcan/OriginsSection'
import ClosingSection from '@/components/vulcan/ClosingSection'
import CredibilitySection from '@/components/vulcan/CredibilitySection'
import SiteFooter from '@/components/vulcan/SiteFooter'

export default function Home() {
  return (
    <div className="vulcan min-h-screen bg-vulcan-ink font-grotesk text-white antialiased selection:bg-vulcan-signal selection:text-white">
      <SiteHeader />
      <main>
        <CinematicExperience>
          <ProblemSection />
          <OriginsSection />
        </CinematicExperience>
        <ClosingSection />
        <CredibilitySection />
      </main>
      <SiteFooter />
    </div>
  )
}
