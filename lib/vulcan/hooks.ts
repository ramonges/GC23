'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)', true)
}
