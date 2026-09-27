import Reveal from './Reveal'
import SectionLabel from './SectionLabel'
import { CONTACT_EMAIL, CONTACT_HREF, FOUNDERS, PRESS } from '@/lib/vulcan/content'

export default function CredibilitySection() {
  return (
    <section id="team" className="border-t border-white/10 bg-vulcan-ink px-5 py-24 sm:px-8 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel index="04">Team</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-3xl font-grotesk text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-6xl">
            Built by people who trace materials for a living.
          </h2>
        </Reveal>

        {FOUNDERS.length > 0 ? (
          <div className="mt-16 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="bg-vulcan-ink p-6">
                {f.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.photo} alt={f.name} loading="lazy" className="aspect-[4/5] w-full object-cover grayscale" />
                )}
                <div className="mt-5 font-grotesk text-xl text-white">{f.name}</div>
                <div className="mt-1 text-sm text-vulcan-aluminum">{f.credential}</div>
                {f.linkedin && (
                  <a href={f.linkedin} target="_blank" rel="noreferrer" className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:text-vulcan-signal">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-vulcan-aluminum">
              Founder profiles are being finalized. Reach the team directly at{' '}
              <a href={CONTACT_HREF} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-vulcan-signal">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Reveal>
        )}

        {PRESS.length > 0 && (
          <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
            {PRESS.map((p) => (
              <figure key={p.outlet}>
                {p.quote && <blockquote className="text-lg leading-relaxed text-white">“{p.quote}”</blockquote>}
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-vulcan-aluminum">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noreferrer" className="hover:text-white">{p.outlet} ↗</a>
                  ) : (
                    p.outlet
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
