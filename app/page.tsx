import SiteHeader from '@/components/vulcan/SiteHeader'
import HeroExperience from '@/components/vulcan/hero/HeroExperience'
import ProblemSection from '@/components/vulcan/ProblemSection'
import IntelligenceLayerSection from '@/components/vulcan/IntelligenceLayerSection'
import WorkflowSection from '@/components/vulcan/WorkflowSection'
import ScenariosSection from '@/components/vulcan/ScenariosSection'
import ExpansionSection from '@/components/vulcan/ExpansionSection'
import MarketSection from '@/components/vulcan/MarketSection'
import TeamSection from '@/components/vulcan/TeamSection'
import AskSection from '@/components/vulcan/AskSection'
import SiteFooter from '@/components/vulcan/SiteFooter'

export default function Home() {
  return (
    <div className="vulcan min-h-screen bg-vulcan-ink font-grotesk text-vulcan-paper antialiased selection:bg-vulcan-signal selection:text-white">
      <SiteHeader />
      <main>
        <HeroExperience />
        <ProblemSection />
        <IntelligenceLayerSection />
        <WorkflowSection />
        <ScenariosSection />
        <ExpansionSection />
        <MarketSection />
        <TeamSection />
        <AskSection />
      </main>
      <SiteFooter />
    </div>
  )
}
