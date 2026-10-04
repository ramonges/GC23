import { create } from 'zustand'

type ExplorerState = {
  /** Robot shown alone in the detail view; null = showroom. */
  selected: string | null
  /** Robot under the pointer (or keyboard focus) in the showroom. */
  browsing: string | null
  /** Part under the pointer or keyboard focus. */
  hoveredPart: string | null
  /** Part opened by click/tap/Enter; stays highlighted until dismissed. */
  pinnedPart: string | null
  exploded: boolean
  colorByCommodity: boolean
  sourcingOpen: boolean
  sourcingCommodity: string | null
  methodologyOpen: boolean
  pointer: { x: number; y: number }
  select: (id: string | null) => void
  setBrowsing: (id: string | null) => void
  hoverPart: (name: string | null) => void
  pinPart: (name: string | null) => void
  toggleExploded: () => void
  toggleColor: () => void
  openSourcing: (commodity?: string | null) => void
  closeSourcing: () => void
  setMethodology: (open: boolean) => void
  setPointer: (x: number, y: number) => void
}

export const useExplorer = create<ExplorerState>((set) => ({
  selected: null,
  browsing: null,
  hoveredPart: null,
  pinnedPart: null,
  exploded: false,
  colorByCommodity: false,
  sourcingOpen: false,
  sourcingCommodity: null,
  methodologyOpen: false,
  pointer: { x: 0, y: 0 },
  select: (id) =>
    set({ selected: id, hoveredPart: null, pinnedPart: null, exploded: false, sourcingOpen: false, sourcingCommodity: null }),
  setBrowsing: (id) => set({ browsing: id }),
  hoverPart: (name) => set({ hoveredPart: name }),
  pinPart: (name) => set({ pinnedPart: name }),
  toggleExploded: () => set((s) => ({ exploded: !s.exploded })),
  toggleColor: () => set((s) => ({ colorByCommodity: !s.colorByCommodity })),
  openSourcing: (commodity) => set((s) => ({ sourcingOpen: true, sourcingCommodity: commodity ?? s.sourcingCommodity })),
  closeSourcing: () => set({ sourcingOpen: false }),
  setMethodology: (open) => set({ methodologyOpen: open }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
}))
