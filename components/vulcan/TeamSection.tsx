'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { FOUNDER_FIT, FOUNDERS } from '@/lib/vulcan/content'
import { EASE, Headline, Label, Reveal, Section } from './ui'

function Portrait({ name, photo, delay }: { name: string; photo?: string; delay: number }) {
  const reduced = useReducedMotion()
  const initials = name.split(' ').map((p) => p[0]).join('')
  return (
    <motion.div
      className={`relative aspect-[4/5] w-full overflow-hidden ${photo ? 'bg-white' : 'bg-vulcan-ink'}`}
      initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-full w-full object-cover object-top saturate-[0.85]" />
      ) : (
        <div className="vulcan-grid-lines flex h-full w-full items-end p-6 opacity-100">
          <span aria-hidden className="font-grotesk text-[clamp(4rem,8vw,8rem)] font-medium leading-none tracking-[-0.05em] text-vulcan-paper/90">{initials}</span>
        </div>
      )}
      {!photo && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,9,9,0.35),rgba(8,9,9,0)_45%)]" />}
    </motion.div>
  )
}

export default function TeamSection() {
  return (
    <Section id="team" theme="light" className="border-t border-vulcan-ink/10">
      <div className="grid grid-cols-12 gap-x-6 gap-y-16">
        <div className="col-span-12 lg:col-span-5">
          <Label light>Founders</Label>
          <Headline lines={['The people behind', 'Vulcan Trade.']} className="mt-10 text-vulcan-ink" />
          <Reveal delay={0.2}>
            <p className="mt-10 max-w-[30rem] text-[clamp(1.1rem,1.35vw,1.3rem)] leading-relaxed text-vulcan-ink/70">{FOUNDER_FIT}</p>
          </Reveal>
        </div>
        <div className="col-span-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {FOUNDERS.map((f, i) => (
            <div key={f.name} className="group">
              <Reveal delay={i * 0.15}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-grotesk text-2xl font-medium tracking-[-0.01em] text-vulcan-ink md:text-[1.75rem]">{f.name}</h3>
                    <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-vulcan-ink/55">{f.role}</div>
                  </div>
                  {f.linkedin && (
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] uppercase tracking-[0.2em] text-vulcan-ink/60 transition-colors hover:text-vulcan-ink"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </Reveal>
              <Portrait name={f.name} photo={f.photo} delay={0.1 + i * 0.15} />
              {f.bio && (
                <Reveal delay={0.3 + i * 0.15}>
                  <p className="mt-5 border-t border-vulcan-ink/15 pt-4 text-[15px] leading-relaxed text-vulcan-ink/70">{f.bio}</p>
                </Reveal>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
