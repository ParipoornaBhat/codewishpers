import type { Node, Edge } from "reactflow"
import { useQuestionStore } from "@/lib/stores/useQuestionStorage"

type IntermediateStep = {
  nodeId: string
  input: any
  output: any
}

type ExecutionResult = {
  passed: boolean
  result: any
  intermediateSteps: IntermediateStep[]
}

type ExecuteOptions = {
  nodes: Node[]
  edges: Edge[]
  testInput: string | number
  fnMutations: Record<string, any>
  updateNode?: (id: string, data: any) => void
}

/**
 * Executes the graph for a single test case input.
 * 
 * - Builds a node-to-value map as it executes.
 * - For function nodes, it uses async `mutateAsync` for evaluation.
 * - Tracks inputs and results and updates nodes optionally via `updateNode`.
 * - Compares final output with expected test case value.
 */
export const executeGraphAndCheckOutput = async ({
  nodes,
  edges,
  testInput,
  fnMutations,
  updateNode,
}: ExecuteOptions): Promise<ExecutionResult> => {
  const idToNode = new Map(nodes.map((n) => [n.id, structuredClone(n)]))
  const valueMap = new Map<string, any>()
  const intermediateSteps: IntermediateStep[] = []

  const inputNode = nodes.find((n) => n.type === "input")
  const outputNode = nodes.find((n) => n.type === "output")

  if (!inputNode || !outputNode) {
    return { passed: false, result: null, intermediateSteps }
  }

  const inputValue = Number(testInput)
  if (isNaN(inputValue)) {
    return { passed: false, result: null, intermediateSteps }
  }

  valueMap.set(inputNode.id, inputValue)
  intermediateSteps.push({
    nodeId: inputNode.id,
    input: [],
    output: inputValue,
  })

  // Build graph
  const dependentsMap = new Map<string, string[]>()
  const prerequisitesCount = new Map<string, number>()

  for (const edge of edges) {
    if (!dependentsMap.has(edge.source)) {
      dependentsMap.set(edge.source, [])
    }
    dependentsMap.get(edge.source)!.push(edge.target)

    prerequisitesCount.set(edge.target, (prerequisitesCount.get(edge.target) || 0) + 1)
  }
  // Step 1: Discover reachable nodes from the input node
const reachable = new Set<string>()
const stack = [inputNode.id]

while (stack.length > 0) {
  const current = stack.pop()!
  if (reachable.has(current)) continue
  reachable.add(current)

  const neighbors = edges
    .filter((e) => e.source === current)
    .map((e) => e.target)
  
  for (const n of neighbors) {
    if (!reachable.has(n)) {
      stack.push(n)
    }
  }
}

// Step 2: Populate readyQueue only with reachable and input-prerequisite-satisfied nodes
const readyQueue: string[] = []
for (const nodeId of reachable) {
  if ((prerequisitesCount.get(nodeId) || 0) === 0) {
    readyQueue.push(nodeId)
  }
}
  while (readyQueue.length > 0) {
    const currentId = readyQueue.shift()!
    const currentNode = idToNode.get(currentId)
    if (!currentNode) continue

    const inputSources = edges.filter(e => e.target === currentId).map(e => e.source)
    const inputValues = inputSources.map(src => valueMap.get(src))

    if (inputValues.some(v => v === undefined)) {
      continue
    }

    let result = undefined

    updateNode?.(currentId, {
      input: inputValues,
      loading: true,
      error: null,
    })

    if (currentNode.type === "input") {
      result = inputValue

    } else if (currentNode.type === "function") {
      const operation = currentNode.data?.operation
      const mutation = fnMutations[operation]
      if (!mutation) {
        updateNode?.(currentId, {
          result: null,
          loading: false,
          error: `Missing function ${operation}`,
        })
        continue
      }

      try {
        result = await mutation.mutateAsync(inputValues)
        updateNode?.(currentId, {
          result,
          input: inputValues,
          loading: false,
          error: null,
        })
      } catch (err: any) {
        updateNode?.(currentId, {
          result: null,
          loading: false,
          error: err?.message ?? "Execution error",
        })
        continue
      }

    } else if (currentNode.type === "output") {
      result = inputValues[0]
      updateNode?.(currentId, { value: result })
    }

    valueMap.set(currentId, result)

    intermediateSteps.push({
      nodeId: currentId,
      input: inputValues,
      output: result,
    })

    const dependents = dependentsMap.get(currentId) || []
    for (const dep of dependents) {
      prerequisitesCount.set(dep, (prerequisitesCount.get(dep) || 1) - 1)
      if (prerequisitesCount.get(dep) === 0) {
        readyQueue.push(dep)
      }
    }
  }

  const actual = valueMap.get(outputNode.id)
  const expected = Number(
    useQuestionStore
      .getState()
      .testCases.find((tc) => String(tc.input) === String(testInput))?.expected
  )

  return {
    passed: actual === expected,
    result: actual,
    intermediateSteps,
  }
}

