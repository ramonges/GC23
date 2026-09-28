import { SCENARIOS } from '@/lib/vulcan/content'
import { Headline, Label, Reveal, Section } from './ui'

function Level({ level }: { level: number }) {
  return (
    <span aria-hidden className="flex gap-1">
      {[1, 2, 3].map((k) => (
        <span key={k} className={`h-1 w-5 ${k <= level ? (level === 3 ? 'bg-vulcan-signal' : 'bg-vulcan-paper/70') : 'bg-white/10'}`} />
      ))}
    </span>
  )
}

export default function ScenariosSection() {
  return (
    <Section id="scenarios" theme="soft">
      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-9">
          <Label>Scenario planning</Label>
          <Headline lines={SCENARIOS.headline} className="mt-10" />
        </div>
      </div>

      <Reveal className="mt-20 md:mt-28" delay={0.1}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/15 font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-muted">
                <th className="w-[30%] py-4 pr-6 font-normal">Route</th>
                {SCENARIOS.metrics.map((m) => (
                  <th key={m} className="py-4 pr-6 font-normal">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.routes.map((r, i) => (
                <tr key={r.id} className={`group border-b border-white/10 transition-colors duration-500 hover:bg-white/[0.02] ${i === 0 ? '' : ''}`}>
                  <td className="py-7 pr-6 align-top">
                    <div className={`font-mono text-[11px] uppercase tracking-[0.2em] ${i === 0 ? 'text-vulcan-signal' : 'text-vulcan-muted'}`}>{r.label}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 font-grotesk text-lg text-vulcan-paper">
                      {r.path.map((p, k) => (
                        <span key={p} className="flex items-center gap-2">
                          {k > 0 && <span className="text-vulcan-muted">→</span>}
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  {r.values.map((v, k) => (
                    <td key={k} className="py-7 pr-6 align-top">
                      <div className="font-mono text-[13px] uppercase tracking-[0.1em] text-vulcan-paper">{v}</div>
                      <div className="mt-3">
                        <Level level={r.levels[k]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-muted/80">Illustrative figures · not connected to live data</p>
      </Reveal>
    </Section>
  )
}
