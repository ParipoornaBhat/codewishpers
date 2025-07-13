// store/useFlowStore.ts
import { create } from "zustand"
import { type Node, type Edge, addEdge, type Connection } from "reactflow"

interface FlowState {
  nodes: Node[]
  edges: Edge[]
  eraserMode: boolean
  zoomLocked: boolean

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addConnection: (conn: Connection) => void
  removeEdge: (edgeId: string) => void
  toggleEraserMode: () => void
  toggleZoomLock: () => void
  resetAll: () => void
  clearAllConnections: () => void
  clearAllNodesExceptInputOutput: () => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  eraserMode: false,
  zoomLocked: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addConnection: (connection) => {
    const updatedEdges = addEdge(connection, get().edges)
    set({ edges: updatedEdges })
  },

  removeEdge: (edgeId) => {
    const newEdges = get().edges.filter((e) => e.id !== edgeId)
    set({ edges: newEdges })
  },

  toggleEraserMode: () => set({ eraserMode: !get().eraserMode }),
  toggleZoomLock: () => set({ zoomLocked: !get().zoomLocked }),

  resetAll: () => {
    const resetNodes = get().nodes.map((node) => {
      if (node.type === "function") {
        return { ...node, data: { ...node.data, input: null, result: null } }
      }
      if (node.type === "output") {
        return { ...node, data: { ...node.data, value: null } }
      }
      return node
    })
    set({ nodes: resetNodes })
  },

  clearAllConnections: () => {
    get().resetAll()
    set({ edges: [] })
  },

  clearAllNodesExceptInputOutput: () => {
    const keepNodes = get().nodes.filter((n) => n.type === "input" || n.type === "output")
    set({ nodes: keepNodes, edges: [] })
  },
}))