import { MARKET } from '@/lib/vulcan/content'
import { CountUp, DrawPath, Label, Reveal, Section } from './ui'

function ExpansionGraphic() {
  return (
    <svg viewBox="0 0 420 300" className="h-auto w-full" role="img" aria-label="Expansion from robotics into broader industrial manufacturing">
      <DrawPath d="M10 290 H410 V10 H10 Z" className="stroke-vulcan-ink/25" duration={1.8} />
      <DrawPath d="M10 290 H190 V130 H10 Z" className="stroke-vulcan-ink/50" delay={0.4} duration={1.6} />
      <DrawPath d="M10 290 H60 V245 H10 Z" className="stroke-vulcan-signal" delay={0.9} duration={1.2} strokeWidth={1.4} />
      <text x={24} y={30} className="fill-vulcan-ink/50 font-mono text-[11px] uppercase tracking-[0.18em]">Industrial manufacturing</text>
      <text x={24} y={150} className="fill-vulcan-ink/70 font-mono text-[11px] uppercase tracking-[0.18em]">Robotics & automation</text>
      <text x={70} y={276} className="fill-vulcan-ink font-mono text-[11px] uppercase tracking-[0.18em]">Initial corridors</text>
    </svg>
  )
}

export default function MarketSection() {
  return (
    <Section id="market" theme="light" className="border-t border-vulcan-ink/10">
      <Label light>Market opportunity</Label>
      <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-16 md:mt-24">
        <div className="col-span-12 grid grid-cols-1 gap-12 sm:grid-cols-3 lg:col-span-7">
          {MARKET.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.12}>
              <div className="font-grotesk text-[clamp(3.6rem,6.4vw,7rem)] font-medium leading-none tracking-[-0.04em] text-vulcan-ink">
                <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <div className="mt-5 font-mono text-[12px] uppercase tracking-[0.22em] text-vulcan-signal">{m.label}</div>
              <p className="mt-3 max-w-[15rem] text-base leading-snug text-vulcan-ink/60">{m.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="col-span-12 md:col-span-8 lg:col-span-4 lg:col-start-9" delay={0.2}>
          <ExpansionGraphic />
        </Reveal>
      </div>
    </Section>
  )
}
