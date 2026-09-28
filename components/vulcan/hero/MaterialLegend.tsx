import { LEGEND } from '@/lib/vulcan/hero'

export default function MaterialLegend() {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.2em]">
      <div className="mb-3 text-vulcan-muted">Material origins</div>
      <ul className="space-y-1.5">
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
