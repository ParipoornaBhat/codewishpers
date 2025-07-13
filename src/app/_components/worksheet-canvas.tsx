"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
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
import { RotateCcw, Eraser, Trash2, MousePointer } from "lucide-react"

const nodeTypes = {
  function: FunctionNode,
  input: InputNode,
  output: OutputNode,
}

// Function operations
const executeOperation = (operation: string, input: number): any => {
  switch (operation) {
    case "square":
      return input * input
    case "cube":
      return input * input * input
    case "add10":
      return input + 10
    case "sub5":
      return input - 5
    case "mul2":
      return input * 2
    case "div3":
      return Math.round((input / 3) * 100) / 100
    case "isEven":
      return input % 2 === 0
    case "isOdd":
      return input % 2 !== 0
    case "isPrime":
      return isPrime(input)
    case "abs":
      return Math.abs(input)
    case "sqrt":
      return Math.round(Math.sqrt(input) * 100) / 100
    case "pow2":
      return Math.pow(2, input)
    case "factorial":
      return factorial(input)
    case "double":
      return input * 2
    case "half":
      return input / 2
    case "negate":
      return -input
    case "increment":
      return input + 1
    case "decrement":
      return input - 1
    case "mod10":
      return input % 10
    case "isPositive":
      return input > 0
    default:
      return input
  }
}

const isPrime = (n: number): boolean => {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

const factorial = (n: number): number => {
  if (n < 0) return 0
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

interface WorksheetCanvasProps {
  worksheetId: string
  initialNodes: Node[]
  initialEdges: Edge[]
  onUpdate: (id: string, nodes: Node[], edges: Edge[]) => void
}

function WorksheetCanvasInner({ worksheetId, initialNodes, initialEdges, onUpdate }: WorksheetCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [eraserMode, setEraserMode] = useState(false)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worksheetId])

  // Execute the function chain whenever nodes or edges change
  useEffect(() => {
    executeChain()
    onUpdate(worksheetId, nodes, edges)
  }, [edges, worksheetId, nodes])

  const executeChain = () => {
    const idToNode = new Map(nodes.map((n) => [n.id, n]))
    const nextNodes: Node[] = nodes.map((n) => ({ ...n }))

    const inputNode = nextNodes.find((n) => n.type === "input")
    const startVal = inputNode && !isNaN(Number(inputNode.data.value)) ? Number(inputNode.data.value) : null
    if (startVal === null) return

    const valueMap = new Map<string, any>([[inputNode.id, startVal]])

    const queue: string[] = [inputNode.id]
    while (queue.length) {
      const current = queue.shift()!
      const curVal = valueMap.get(current)
      edges
        .filter((e) => e.source === current)
        .forEach((e) => {
          const target = idToNode.get(e.target)
          if (!target) return

          if (target.type === "function") {
            const out = executeOperation(target.data.operation, curVal)
            valueMap.set(target.id, out)
            queue.push(target.id)
          } else if (target.type === "output") {
            valueMap.set(target.id, curVal)
          }
        })
    }

    let changed = false
    const updated = nextNodes.map((node) => {
      if (node.type === "function") {
        const incomingEdge = edges.find((e) => e.target === node.id)
        const newInput = incomingEdge ? valueMap.get(incomingEdge.source) : null
        const newOutput = valueMap.get(node.id)
        if (node.data.input !== newInput || node.data.result !== newOutput) {
          changed = true
          return {
            ...node,
            data: { ...node.data, input: newInput, result: newOutput },
          }
        }
        return node
      }
      if (node.type === "output") {
        const newVal = valueMap.get(node.id) ?? null
        if (node.data.value !== newVal) {
          changed = true
          return { ...node, data: { ...node.data, value: newVal } }
        }
        return node
      }
      return node
    })

    if (changed) {
      setNodes(updated)
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      if (eraserMode) return // Don't allow connections in eraser mode

      if (params.target) {
        const targetNode = nodes.find((node) => node.id === params.target)
        if (targetNode?.type === "output") {
          const existingConnection = edges.find((edge) => edge.target === params.target)
          if (existingConnection) {
            setEdges((eds) => eds.filter((edge) => edge.target !== params.target))
          }
        }
      }

      const newEdge = {
        ...params,
        animated: true,
        style: {
          stroke: "#8b5cf6",
          strokeWidth: 2,
          cursor: eraserMode ? "crosshair" : "default",
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges, nodes, edges, eraserMode],
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
    setNodes((nds) =>
      nds.map((node) => {
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
      }),
    )
  }

  const clearAllConnections = () => {
    setEdges([])
    resetWorksheet()
  }

  const clearAllNodes = () => {
    setNodes((nds) => nds.filter((node) => node.type === "input" || node.type === "output"))
    setEdges([])
  }

  const toggleEraserMode = () => {
    setEraserMode(!eraserMode)
  }

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
          variant="outline"
          onClick={resetWorksheet}
          className="bg-white dark:bg-gray-700 dark:border-gray-600 shadow-md"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset Values
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
        nodes={nodes}
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
        className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 ${eraserMode ? "cursor-crosshair" : ""}`}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background color="#e2e8f0" gap={20} className="dark:bg-gray-900" />
        <Controls className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg" />
        <MiniMap
          className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg"
          nodeColor="#8b5cf6"
          maskColor="rgba(0, 0, 0, 0.1)"
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
