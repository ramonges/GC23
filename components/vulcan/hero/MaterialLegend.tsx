import { LEGEND } from '@/lib/vulcan/hero'

export default function MaterialLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
      <div className="text-vulcan-muted">Material origins</div>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {LEGEND.map((m, i) => (
          <li key={m} className={`flex items-center gap-2.5 ${i === 0 ? 'text-vulcan-paper' : 'text-vulcan-muted/70'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-vulcan-signal' : 'bg-vulcan-muted/60'}`} />
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}
