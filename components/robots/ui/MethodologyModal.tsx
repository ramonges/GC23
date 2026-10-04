'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseButton } from './primitives'

const SECTIONS = [
  {
    title: 'What this is',
    body: 'An educational estimate of what commercial robots are made of, part by part. No manufacturer publishes a bill of materials for these robots, so every number here is an estimate, not a disclosure.',
  },
  {
    title: 'How part masses are estimated',
    body: 'Each robot’s published height, weight and battery capacity are split across its subsystems using teardown data from comparable hardware: humanoid actuators, EV-style battery packs, embedded computers and machined aluminium structures. Typical material recipes are then applied to each component, for example NdFeB magnets at about 30 wt% Nd/Pr, 3 wt% Dy, 66 wt% Fe and 1 wt% B, or NMC811 cells at about 12 wt% nickel.',
  },
  {
    title: 'How sourcing is estimated',
    body: 'Country shares are each country’s share of world mining or refining output, taken from the USGS Mineral Commodity Summaries and IEA critical-minerals data and adjusted for the grade the part needs. Battery-grade lithium hydroxide, for example, follows refining geography rather than mine geography. They are not traced from any manufacturer’s suppliers.',
  },
  {
    title: 'Confidence tags',
    body: 'High: well-established material choice or concentrated global supply. Medium: a typical industry choice that varies between designs. Low: an informed guess, often for polymers, electronics or small components.',
  },
  {
    title: '3D models',
    body: 'Microduck is open hardware, so it is shown from its published CAD, assembled with the official MuJoCo model and its part masses taken from that model. Tesla Optimus is a procedural reconstruction from public renders. The other robots are stylised placeholders built from primitives. Every model uses one named mesh per part, so licensed GLB models can replace them without changing the data.',
  },
]

export default function MethodologyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-vulcan-ink/75 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="methodology-title"
            className="max-h-[88vh] w-full max-w-[640px] overflow-y-auto border border-white/10 bg-vulcan-charcoal p-6 text-vulcan-paper outline-none sm:p-8"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vulcan-signal">Methodology</p>
                <h2 id="methodology-title" className="mt-2 text-[26px] font-light leading-tight tracking-[-0.015em]">
                  Estimated, not manufacturer-disclosed.
                </h2>
              </div>
              <CloseButton onClick={onClose} />
            </div>
            <div className="mt-6 space-y-5">
              {SECTIONS.map((s) => (
                <section key={s.title} className="border-t border-white/10 pt-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-vulcan-aluminum">{s.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-vulcan-paper/80">{s.body}</p>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
