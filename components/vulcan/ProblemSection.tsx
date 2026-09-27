import Reveal from './Reveal'
import SectionLabel from './SectionLabel'

export default function ProblemSection() {
  return (
    <section id="problem" className="relative scroll-mt-20 border-t border-white/10 bg-vulcan-ink px-5 py-24 sm:px-8 md:px-12 md:py-36">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel index="01">The problem</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-4xl font-grotesk text-5xl font-medium leading-[1] tracking-[-0.03em] text-white md:text-7xl lg:text-8xl">
            Opacity has a cost.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-vulcan-aluminum">
            When a port closes, a mine halts, or a corridor backs up, most manufacturers learn about it from their suppliers — after the delay has already reached the line.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-16 md:mt-24">
          <div className="grid border border-white/10 md:grid-cols-[1fr_auto_1fr]">
            <div className="p-8 md:p-12">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-aluminum">Unmonitored route</div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-grotesk text-[6.5rem] font-medium leading-none tracking-[-0.05em] text-white/35 md:text-[10rem]">21</span>
                <span className="font-grotesk text-2xl text-white/40">days</span>
              </div>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-vulcan-aluminum">
                From a disruption at the source to a secured alternative supply, when the first signal arrives through a supplier notice.
              </p>
            </div>
            <div className="flex items-center justify-center border-y border-white/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-vulcan-aluminum md:border-x md:border-y-0">
              vs
            </div>
            <div className="p-8 md:p-12">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-signal">Monitored route</div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-grotesk text-[6.5rem] font-medium leading-none tracking-[-0.05em] text-white md:text-[10rem]">3</span>
                <span className="font-grotesk text-2xl text-white/70">days</span>
              </div>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-vulcan-aluminum">
                When the disruption is flagged at the mine or port, and alternative origins and routes are already mapped.
              </p>
            </div>
          </div>

          <div className="grid gap-8 border-x border-b border-white/10 p-8 md:grid-cols-2 md:p-12">
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">
                <span>Single origin</span>
                <span className="text-white">100% exposed</span>
              </div>
              <div className="mt-3 h-2 w-full bg-white/35" />
              <p className="mt-3 text-sm text-vulcan-aluminum">One port closure halts the entire volume.</p>
            </div>
            <div>
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">
                <span>Three mapped origins</span>
                <span className="text-vulcan-signal">~33% exposed</span>
              </div>
              <div className="mt-3 grid h-2 grid-cols-3 gap-1">
                <div className="bg-vulcan-signal" />
                <div className="bg-white/15" />
                <div className="bg-white/15" />
              </div>
              <p className="mt-3 text-sm text-vulcan-aluminum">The same closure touches one lane of three.</p>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum/70">
            Illustrative scenario · figures are not measured data
          </p>
        </Reveal>
      </div>
    </section>
  )
}
