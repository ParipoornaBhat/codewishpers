"use client"

import type React from "react"
import { FUNCTION_META } from "@/lib/functionMeta" // Importing the function metadata
import { useCallback, useState, useEffect, useRef } from "react"
import {api} from "@/trpc/react"
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import FunctionNode from "./function-node"
import InputNode from "./input-node"
import OutputNode from "./output-node"
import { Button } from "@/components/ui/button"
import { RotateCcw, Eraser, Trash2, MousePointer, Lock, Unlock } from "lucide-react"

const nodeTypes = {
  function: FunctionNode,
  input: InputNode,
  output: OutputNode,
}



interface WorksheetCanvasProps {
  worksheetId: string
  initialNodes: Node[]
  initialEdges: Edge[]
  onUpdate: (id: string, nodes: Node[], edges: Edge[]) => void
  autoSave :boolean
}

function WorksheetCanvasInner({ worksheetId, initialNodes, initialEdges, onUpdate, autoSave}: WorksheetCanvasProps) {
//auto save funtionality using localStorage
// 🧠 LocalStorage keys scoped by worksheetId

const getLocalKey = (id: string) => `worksheet-${id}`

const saveToLocalStorage = (id: string, nodes: Node[], edges: Edge[]) => {
  try {
    localStorage.setItem(
      getLocalKey(id),
      JSON.stringify({ nodes, edges })
    )
  } catch (e) {
    console.warn("📦 Failed to save worksheet to localStorage", e)
  }
}
const loadFromLocalStorage = (id: string): { nodes: Node[]; edges: Edge[] } | null => {
  try {
    const raw = localStorage.getItem(getLocalKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return parsed
    }
  } catch (e) {
    console.warn("📦 Failed to load worksheet from localStorage", e)
  }
  return null
}

 //New: Save to localStorage
useEffect(() => {
  const saved = loadFromLocalStorage(worksheetId)
  if (saved) {
    setNodes(saved.nodes)
    setEdges(saved.edges)
  } else {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }
  // Reset previous input tracking too
  prevInputValRef.current = null
  prevFuncInputEdgesRef.current = new Map()
}, [worksheetId])

// Others
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [eraserMode, setEraserMode] = useState(false)
  const [zoomLocked, setZoomLocked] = useState(false)

  // Add missing refs for previous input value and function input edges
  const prevInputValRef = useRef<number | null>(null)
  const prevFuncInputEdgesRef = useRef<Map<string, string[]>>(new Map())

  useEffect(() => {
  const saved = loadFromLocalStorage(worksheetId)  //New: Save to localStorage
  if (saved) {
    setNodes(saved.nodes)
    setEdges(saved.edges)
  } else {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }
  // Reset previous input tracking too
  prevInputValRef.current = null
  prevFuncInputEdgesRef.current = new Map()
}, [worksheetId])


  // Execute the function chain whenever nodes or edges change
 useEffect(() => {
  const inputNode = nodes.find((n) => n.type === "input")
  const inputVal = inputNode && !isNaN(Number(inputNode.data?.value)) ? Number(inputNode.data.value) : null

  // Detect if input value changed
  const inputChanged = prevInputValRef.current !== inputVal

  // Track current input edges for each function node
  const currentFuncInputEdges = new Map<string, string[]>()

  nodes.forEach((node) => {
    if (node.type === "function") {
      const inputSources = edges
        .filter((e) => e.target === node.id)
        .map((e) => e.source)
        .sort()

      currentFuncInputEdges.set(node.id, inputSources)
    }
  })

  // Detect if new input edge is added to any function node
  let inputEdgeChanged = false

  for (const [nodeId, currentInputs] of currentFuncInputEdges.entries()) {
    const prevInputs = prevFuncInputEdgesRef.current.get(nodeId) || []
    if (prevInputs.join(",") !== currentInputs.join(",")) {
      inputEdgeChanged = true
      break
    }
  }

  if (inputChanged || inputEdgeChanged) {
    const timeout = setTimeout(() => {
      executeChain()
      onUpdate(worksheetId, nodes, edges)
      if (autoSave) {
  saveToLocalStorage(worksheetId, nodes, edges)
}
  //New: Save to localStorage
      // Update references
      prevInputValRef.current = inputVal
      prevFuncInputEdgesRef.current = currentFuncInputEdges
    }, 300)

    return () => clearTimeout(timeout)
  }
}, [nodes, edges])

const refreshChain = () => {
  const inputNode = nodes.find((n) => n.type === "input")
  const inputVal =
    inputNode && !isNaN(Number(inputNode.data?.value))
      ? Number(inputNode.data.value)
      : null

  const inputChanged = prevInputValRef.current !== inputVal

  const currentFuncInputEdges = new Map<string, string[]>()

  nodes.forEach((node) => {
    if (node.type === "function") {
      const inputs = edges
        .filter((e) => e.target === node.id)
        .map((e) => e.source)
        .sort()
      currentFuncInputEdges.set(node.id, inputs)
    }
  })

  let inputEdgeChanged = false

  for (const [nodeId, currentInputs] of currentFuncInputEdges.entries()) {
    const prevInputs = prevFuncInputEdgesRef.current.get(nodeId) || []
    if (prevInputs.join(",") !== currentInputs.join(",")) {
      inputEdgeChanged = true
      break
    }
  }

  if (inputChanged || inputEdgeChanged) {
    const timeout = setTimeout(() => {
      executeChain()
      onUpdate(worksheetId, nodes, edges)
      if (autoSave) {
  saveToLocalStorage(worksheetId, nodes, edges)
}


      prevInputValRef.current = inputVal
      prevFuncInputEdgesRef.current = currentFuncInputEdges
    }, 300)

    return () => clearTimeout(timeout)
  }
}


useEffect(() => {
  const cleanup = refreshChain()
  return cleanup
}, [nodes, edges])




const executeChain = async () => {
  const idToNode = new Map(nodes.map((n) => [n.id, n]))
  const nextNodes: Node[] = nodes.map((n) => ({ ...n }))

  const inputNode = nextNodes.find((n) => n.type === "input")
  const startVal =
    inputNode && !isNaN(Number(inputNode.data.value))
      ? Number(inputNode.data.value)
      : null

  if (!inputNode || startVal === null) return

  const valueMap = new Map<string, any>([[inputNode.id, startVal]])
  const visited = new Set<string>()
  const queue: string[] = [inputNode.id]

  while (queue.length) {
    const current = queue.shift()!
    const curVal = valueMap.get(current)
    visited.add(current)

    const outgoing = edges.filter((e) => e.source === current)

    for (const edge of outgoing) {
      const target = idToNode.get(edge.target)
      if (!target) continue

      const incomingEdges = edges.filter((e) => e.target === target.id)
      const inputValues = incomingEdges
        .map((e) => valueMap.get(e.source))
        .filter((v) => v !== undefined)

      if (target.type === "function") {
        const meta = FUNCTION_META.find((fn) => fn.id === target.data.operation)
        const requiredInputs = meta?.numInputs ?? 1
        if (inputValues.length < requiredInputs) continue

        const mutation = fnMutations?.[target.data.operation]
        if (!mutation) {
          console.warn(`❌ No mutation found for "${target.data.operation}"`)
          updateNode(target.id, {
            result: null,
            loading: false,
            error: `Operation "${target.data.operation}" not found.`,
          })
          continue
        }

        updateNode(target.id, { loading: true, error: null })

        try {
          const res = await mutation.mutateAsync(inputValues)
          valueMap.set(target.id, res)
          updateNode(target.id, {
            result: res,
            input: inputValues,
            loading: false,
            error: null,
          })

          queue.push(target.id)
        } catch (err: any) {
          console.error(`❌ Error in node ${target.id}`, err)
          updateNode(target.id, {
            result: null,
            loading: false,
            error: err?.message ?? "Unknown error",
          })
        }
      }

      if (target.type === "output") {
        const fromVal = valueMap.get(current)
        if (fromVal !== undefined) {
          valueMap.set(target.id, fromVal)
          updateNode(target.id, { value: fromVal })
        }
      }
    }
  }
}

// Utility function to update a single node's data
const updateNode = (id: string, data: Record<string, any>) => {
  setNodes((prev) =>
    prev.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    )
  )
}

 const onConnect = useCallback(
  (params: Connection) => {
    if (eraserMode) return

    const targetNode = nodes.find((node) => node.id === params.target)
    if (!targetNode) return

    // Ensure params.source and params.target are strings and not null
    if (typeof params.source !== "string" || typeof params.target !== "string") {
      console.warn("Invalid connection: source or target is not a string.")
      return
    }

    // Enforce input limits
    let maxInputs = 1
    if (targetNode.type === "function") {
      const meta = FUNCTION_META.find((fn) => fn.id === targetNode.data.operation)
      maxInputs = meta?.numInputs ?? 1
    }
    if (targetNode.type === "output") {
      maxInputs = 1
    }

    const currentInputs = edges.filter((e) => e.target === params.target).length
    if (currentInputs >= maxInputs) {
      console.warn(`⚠️ Max inputs reached for ${params.target}`)
      return
    }

    const newEdge: Edge = {
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      animated: true,
      style: {
        stroke: "#8b5cf6",
        strokeWidth: 2,
        cursor: "default",
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    }

    const updatedEdges = addEdge(newEdge, edges)
    setEdges(updatedEdges)

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const incoming = updatedEdges.filter((e) => e.target === node.id)

        const inputValues = incoming.map((edge) => {
          const sourceNode = prevNodes.find((n) => n.id === edge.source)
          if (!sourceNode) return null

          if (sourceNode.type === "function") return sourceNode.data.result ?? null
          if (sourceNode.type === "input") {
            const raw = sourceNode.data.value
            return raw !== "" && !isNaN(Number(raw)) ? Number(raw) : null
          }

          return null
        })

        const isOutput = node.type === "output"
        const outputVal = inputValues.length > 0 ? inputValues[0] : null

        return {
          ...node,
          data: {
            ...node.data,
            input: inputValues,
            inputCount: inputValues.length,
            ...(isOutput ? { value: outputVal } : {}),
          },
        }
      })
    )
  },
  [eraserMode, edges, nodes, setEdges, setNodes]
)

  const onEdgeClick = useCallback(
  (event: React.MouseEvent, edge: Edge) => {
    if (eraserMode) {
      event.stopPropagation()
      // Remove the clicked edge
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))

      // Show visual feedback
      const edgeElement = event.target as HTMLElement
      if (edgeElement) {
        edgeElement.style.stroke = "#ef4444"
        edgeElement.style.strokeWidth = "4"
        setTimeout(() => {
          // Edge might be removed by now, so check if it still exists
          if (edgeElement.parentNode) {
            edgeElement.style.stroke = "#8b5cf6"
            edgeElement.style.strokeWidth = "2"
          }
        }, 200)
      }
    }
  },
  [eraserMode, setEdges],
)

const onDragOver = useCallback((event: React.DragEvent) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = "move"
}, [])

const onDrop = useCallback(
  (event: React.DragEvent) => {
    event.preventDefault()

    const type = event.dataTransfer.getData("application/reactflow")
    const functionData = event.dataTransfer.getData("application/json")

    if (typeof type === "undefined" || !type) {
      return
    }

    const position = reactFlowInstance?.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    if (type === "function") {
      const func = JSON.parse(functionData)

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "function",
        position,
        data: {
          ...func,
          operation: func.id, // ✅ Required for proper execution
          result: null,
          input: null,
          isExecuting: false,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    }
  },
  [reactFlowInstance, setNodes],
)


  const resetWorksheet = () => {
  const cleared = nodes.map((node) => {
    if (node.type === "function") {
      return {
        ...node,
        data: {
          ...node.data,
          input: null,
          result: null,
        },
      }
    } else if (node.type === "output") {
      return {
        ...node,
        data: {
          ...node.data,
          value: null,
        },
      }
    }
    return node
  })

  setNodes(cleared)

  // Let state update, then run the chain and refresh logic
  setTimeout(() => {
    executeChain()
    onUpdate(worksheetId, cleared, edges)
    if(autoSave){
    saveToLocalStorage(worksheetId, cleared, edges)}
    refreshChain()
  }, 0)
}

  const clearAllConnections = () => {
    setEdges([])
    resetWorksheet()
        if(autoSave){
    saveToLocalStorage(worksheetId, nodes, []) // no edges
        }
  }

  const clearAllNodes = () => {
    setNodes((nds) => nds.filter((node) => node.type === "input" || node.type === "output"))
    setEdges([])
        if(autoSave){
    saveToLocalStorage(worksheetId, [], [])
        }
  }

  const toggleEraserMode = () => {
    setEraserMode(!eraserMode)
  }

  const toggleZoomLock = () => {
    setZoomLocked(!zoomLocked)
  }

  const handleDeleteNode = useCallback(
  (nodeId: string) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.filter((node) => node.id !== nodeId)

      setEdges((prevEdges) => {
        const updatedEdges = prevEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
        // Save to localStorage using updated versions
            if(autoSave){
        saveToLocalStorage(worksheetId, updatedNodes, updatedEdges)
            }
        return updatedEdges
      })

      return updatedNodes
    })
  },
  [worksheetId]
)


  // Update edge styles based on eraser mode
  const styledEdges = edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      cursor: eraserMode ? "crosshair" : "default",
      strokeWidth: eraserMode ? 3 : 2,
      stroke: eraserMode ? "#ef4444" : "#8b5cf6",
    },
    className: eraserMode ? "hover:stroke-red-600" : "",
  }))
  // 🧠 tRPC utils (for optional invalidation or refetching later)
  const utils = api.useUtils()

  // 🛠️ Your tRPC mutation hooks per operation
 const fnMutations = Object.fromEntries(
  FUNCTION_META.map((meta) => [meta.id, (api.f as any)[meta.id].useMutation()])
)

  return (
    <div className="w-full h-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={eraserMode ? "default" : "outline"}
          onClick={toggleEraserMode}
          className={`bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md ${eraserMode ? "bg-red-500 text-white hover:bg-red-600" : ""}`}
        >
          {eraserMode ? <MousePointer className="w-4 h-4 mr-1" /> : <Eraser className="w-4 h-4 mr-1" />}
          {eraserMode ? "Exit Eraser" : "Eraser Tool"}
        </Button>
        <Button
          size="sm"
          variant={zoomLocked ? "default" : "outline"}
          onClick={toggleZoomLock}
          className={`bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md ${zoomLocked ? "bg-blue-500 text-white hover:bg-blue-600" : ""}`}
        >
          {zoomLocked ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
          {zoomLocked ? "Zoom Locked" : "Lock Zoom"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={resetWorksheet}
          className="bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Refresh Values
        </Button>
        

        <Button
          size="sm"
          variant="outline"
          onClick={clearAllConnections}
          className="bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear All Lines
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearAllNodes}
          className="bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Eraser Mode Indicator */}
      {eraserMode && (
        <div className="absolute top-16 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-md shadow-md text-sm">
          🎯 Eraser Mode: Click on connections to delete them
        </div>
      )}

      <ReactFlow
        nodes={nodes.map((node) =>
          node.type === "function" ? { ...node, data: { ...node.data, onDelete: handleDeleteNode } } : node,
        )}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.1,
          minZoom: 0.1,
          maxZoom: 2,
        }}
        minZoom={0.1}
        maxZoom={2}
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
        nodeExtent={[
          [-1800, -1800],
          [1800, 1800],
        ]}
        zoomOnScroll={!zoomLocked}
        zoomOnPinch={!zoomLocked}
        zoomOnDoubleClick={!zoomLocked}
        panOnScroll={zoomLocked}
        className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 ${eraserMode ? "cursor-crosshair" : ""}`}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background color="#e2e8f0" gap={20} className="dark:bg-gray-900" />
        <Controls className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg" />
        <MiniMap
          className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg"
          style={{
            width: 200,
            height: 150,
            position: "absolute",
            bottom: 10,
            right: 10,
          }}
          nodeColor={(node) => {
            switch (node.type) {
              case "input":
                return "#3b82f6" // blue
              case "output":
                return "#10b981" // green
              case "function":
                return "#8b5cf6" // purple
              default:
                return "#6b7280" // gray
            }
          }}
          maskColor="rgba(139, 92, 246, 0.2)"
          pannable={true}
          zoomable={false}
          inversePan={false}
        />
      </ReactFlow>

    </div>
  )
}

export default function WorksheetCanvas(props: WorksheetCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorksheetCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
