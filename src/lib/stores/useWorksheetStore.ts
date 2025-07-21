import { create } from "zustand"
import type { Node, Edge } from "reactflow"

interface Worksheet {
  nodes: Node[]
  edges: Edge[]
}

interface WorksheetState {
  worksheets: Record<string, Worksheet> // only ONE key at any time
  setWorksheet: (id: string, nodes: Node[], edges: Edge[]) => void
  getCurrentWorksheet: () => { id: string; worksheet: Worksheet } | null
}

export const useWorksheetStore = create<WorksheetState>()((set, get) => ({
  worksheets: {},

  setWorksheet: (id, nodes, edges) =>
    set(() => ({
      worksheets: {
        [id]: { nodes, edges }, // overwrite everything
      },
    })),

  getCurrentWorksheet: () => {
    const entries = Object.entries(get().worksheets)
    if (entries.length === 0) return null
    const firstEntry = entries[0]
    if (!firstEntry) return null
    const [id, worksheet] = firstEntry
    return { id, worksheet }
  },
}))
