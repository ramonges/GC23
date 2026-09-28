import SiteHeader from '@/components/vulcan/SiteHeader'
import HeroExperience from '@/components/vulcan/hero/HeroExperience'
import ProblemSection from '@/components/vulcan/ProblemSection'
import TeamSection from '@/components/vulcan/TeamSection'
import SolutionSection from '@/components/vulcan/SolutionSection'
import FinalCtaSection from '@/components/vulcan/FinalCtaSection'
import SiteFooter from '@/components/vulcan/SiteFooter'

export default function Home() {
  return (
    <div className="vulcan min-h-screen bg-vulcan-ink font-grotesk text-vulcan-paper antialiased selection:bg-vulcan-signal selection:text-white">
      <SiteHeader />
      <main>
        <HeroExperience />
        <ProblemSection />
        <SolutionSection />
        <TeamSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
