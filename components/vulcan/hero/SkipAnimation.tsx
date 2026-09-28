export default function SkipAnimation({ onSkip, label = 'Skip animation' }: { onSkip: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="group flex flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-paper/70 transition-colors hover:text-white"
    >
      <span className="[writing-mode:vertical-rl]">{label}</span>
      <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-white/15">
        <span className="vulcan-scrollcue absolute inset-x-0 top-0 block h-3 bg-vulcan-signal" />
      </span>
    </button>
  )
}
