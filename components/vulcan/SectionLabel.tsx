export default function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-aluminum">
      <span className="text-vulcan-signal">{index}</span>
      <span className="h-px w-8 bg-white/20" />
      <span>{children}</span>
    </div>
  )
}
