import type { Node, Edge } from "reactflow"
import { useQuestionStore } from "@/lib/stores/useQuestionStorage"
import { toast } from "sonner"

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
  const erroredNodes = new Set<string>()

  const inputNode = nodes.find((n) => n.type === "input")
  const outputNode = nodes.find((n) => n.type === "output")

  if (!inputNode || !outputNode) {
    return { passed: false, result: null, intermediateSteps }
  }

  // keep input as string
  const inputValue = String(testInput)
  valueMap.set(inputNode.id, inputValue)
  intermediateSteps.push({ nodeId: inputNode.id, input: [], output: inputValue })

  // helper to normalize any value into a string (objects -> JSON)
  const normalizeToString = (v: any): string | undefined => {
    if (v === undefined || v === null) return undefined
    if (typeof v === "object") {
      try {
        return JSON.stringify(v)
      } catch {
        return String(v)
      }
    }
    return String(v)
  }

  // Build dependency maps
  const dependentsMap = new Map<string, string[]>()
  const prerequisitesCount = new Map<string, number>()
  for (const edge of edges) {
    if (!dependentsMap.has(edge.source)) dependentsMap.set(edge.source, [])
    dependentsMap.get(edge.source)!.push(edge.target)
    prerequisitesCount.set(edge.target, (prerequisitesCount.get(edge.target) || 0) + 1)
  }

  // Discover reachable nodes from the input node
  const reachable = new Set<string>()
  const stack = [inputNode.id]
  while (stack.length > 0) {
    const cur = stack.pop()!
    if (reachable.has(cur)) continue
    reachable.add(cur)
    const neighbors = edges.filter((e) => e.source === cur).map((e) => e.target)
    for (const n of neighbors) if (!reachable.has(n)) stack.push(n)
  }

  // Prepare ready queue with reachable nodes that have zero prerequisites
  const readyQueue: string[] = []
  for (const nodeId of reachable) {
    if ((prerequisitesCount.get(nodeId) || 0) === 0) readyQueue.push(nodeId)
  }

  while (readyQueue.length > 0) {
    const currentId = readyQueue.shift()!
    const currentNode = idToNode.get(currentId)
    if (!currentNode) continue

    const inputSources = edges.filter((e) => e.target === currentId).map((e) => e.source)
    const inputValues = inputSources.map((src) => valueMap.get(src))

    // if some inputs aren't ready, skip for now
    if (inputValues.some((v) => v === undefined)) continue

    updateNode?.(currentId, { input: inputValues, loading: true, error: null })

    let rawResult: any = undefined

    if (currentNode.type === "input") {
      rawResult = inputValue
    } else if (currentNode.type === "function") {
      const operation = currentNode.data?.operation
      const mutation = fnMutations[operation]
      if (!mutation) {
        const msg = `Missing function ${operation}`
        updateNode?.(currentId, { result: null, loading: false, error: msg })
        if (!erroredNodes.has(currentId)) {
          toast.error(`Node Error (${operation}): ${msg}`)
          erroredNodes.add(currentId)
        }
        return { passed: false, result: msg, intermediateSteps }
      }

      try {
        const res = await mutation.mutateAsync(inputValues)

        // backend convention support: { success, result, error }
        if (res && typeof res === "object" && "success" in res) {
          if (!res.success) {
            const msg = res.error ?? "Execution failed"
            updateNode?.(currentId, { result: null, loading: false, error: msg })
            if (!erroredNodes.has(currentId)) {
              toast.error(`Node Error (${operation}): ${msg}`)
              erroredNodes.add(currentId)
            }
            return { passed: false, result: msg, intermediateSteps }
          }
          rawResult = res.result
        } else {
          // raw value returned
          rawResult = res
        }
      } catch (err: any) {
        const msg = err?.message ?? "Execution error"
        updateNode?.(currentId, { result: null, loading: false, error: msg })
        if (!erroredNodes.has(currentId)) {
          toast.error(`Node Error (${operation}): ${msg}`)
          erroredNodes.add(currentId)
        }
        return { passed: false, result: msg, intermediateSteps }
      }
    } else if (currentNode.type === "output") {
      rawResult = inputValues[0]
    }

    // normalize result to string before storing/passing
    const resultStr = normalizeToString(rawResult)

    // update UI with the stringified result
    updateNode?.(currentId, {
      result: resultStr,
      input: inputValues,
      loading: false,
      error: null,
    })

    // store string for downstream nodes
    valueMap.set(currentId, resultStr)

    intermediateSteps.push({ nodeId: currentId, input: inputValues, output: resultStr })

    // enqueue dependents (only reachable ones)
    const dependents = dependentsMap.get(currentId) || []
    for (const dep of dependents) {
      prerequisitesCount.set(dep, (prerequisitesCount.get(dep) || 1) - 1)
      if ((prerequisitesCount.get(dep) || 0) === 0 && reachable.has(dep)) {
        readyQueue.push(dep)
      }
    }
  }

  // final actual (already normalized to string or undefined)
  const actual = valueMap.get(outputNode.id)

  const tc = useQuestionStore
    .getState()
    .testCases.find((tc) => String(tc.input) === String(testInput))

  const expectedRaw = tc?.expected
  const expectedStr = typeof expectedRaw === "undefined" ? undefined : String(expectedRaw)
  const actualStr = typeof actual === "undefined" ? undefined : String(actual)

  const passed = typeof expectedStr !== "undefined" && actualStr === expectedStr

  return {
    passed: !!passed,
    result: actualStr,
    intermediateSteps,
  }
}
