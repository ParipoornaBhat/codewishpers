"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, X, Play, History, Lightbulb, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { FUNCTION_META } from "@/lib/functionMeta"
import { api } from "@/trpc/react"

interface TestPanelProps {
  worksheet: any
  onClose: () => void
}

export default function TestPanel({ worksheet, onClose }: TestPanelProps) {
  const [selectedFunction, setSelectedFunction] = useState<string>("")
const [testInputs, setTestInputs] = useState<string[]>(() => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("test_inputs")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
})
const [testHistory, setTestHistory] = useState<any[]>(() => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("test_history")
  return stored ? JSON.parse(stored) : []
})
  const [isLoading, setIsLoading] = useState(false)
  const [lastTestOutput, setLastTestOutput] = useState<string | null>(null)
  const [open, setOpen] = useState(false)


  const fnMutations = Object.fromEntries(
    FUNCTION_META.map((meta) => [meta.id, (api.f as any)[meta.id]?.useMutation?.()])
  )

  // Load from localStorage
  useEffect(() => {
    const storedFn = localStorage.getItem("test_selectedFunction")
    const storedOutput = localStorage.getItem("test_output")
    const storedHistory = localStorage.getItem("test_history")
   const storedInputs = localStorage.getItem("test_inputs")

    if (storedFn) setSelectedFunction(storedFn)
    if (storedInputs) setTestInputs(JSON.parse(storedInputs))
    if (storedOutput) setLastTestOutput(storedOutput)
    if (storedHistory) setTestHistory(JSON.parse(storedHistory))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("test_selectedFunction", selectedFunction)
  }, [selectedFunction])

useEffect(() => {
  localStorage.setItem("test_inputs", JSON.stringify(testInputs))
}, [testInputs])


  useEffect(() => {
    if (lastTestOutput !== null) {
      localStorage.setItem("test_output", lastTestOutput)
    }
  }, [lastTestOutput])

  useEffect(() => {
    localStorage.setItem("test_history", JSON.stringify(testHistory))
  }, [testHistory])

const runTest = async () => {
  if (!selectedFunction || testInputs.length === 0) return

  // Validate all input fields
  if (testInputs.some((input) => input.trim() === "")) {
    alert("Please fill in all input fields.")
    return
  }

  const meta = FUNCTION_META.find((f) => f.id === selectedFunction)
  const mutation = fnMutations[selectedFunction]

  if (!meta || !mutation) {
    console.warn("Function meta or mutation not found")
    return
  }

  // Parse inputs
  let inputs: number[]
  try {
    inputs = testInputs.map((input, i) => {
      const parsed = parseFloat(input)
      if (isNaN(parsed)) throw new Error(`Input ${i + 1} is not a valid number.`)
      return parsed
    })
  } catch (err: any) {
    alert(err.message || "Invalid inputs.")
    return
  }

  setIsLoading(true)

  try {
    const result = await mutation.mutateAsync(inputs)

    const outputStr = `Result: ${result}`
    setLastTestOutput(outputStr)

    const newTest = {
      id: Date.now(),
      function: selectedFunction,
      input: inputs.join(", "),
      output: outputStr,
      timestamp: new Date().toLocaleTimeString(),
    }

    setTestHistory((prev) => [newTest, ...prev])
  } catch (err: any) {
    const errorStr = `Error: ${err?.message || "Unknown error"}`
    setLastTestOutput(errorStr)

    const newTest = {
      id: Date.now(),
      function: selectedFunction,
      input: testInputs.join(", "),
      output: errorStr,
      timestamp: new Date().toLocaleTimeString(),
    }

    setTestHistory((prev) => [newTest, ...prev])
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Function Testing</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Tester Card */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4" />
                Test Individual Function
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs mb-1 block">Select Function</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between text-sm"
                    >
                      {selectedFunction
                        ? `${selectedFunction} (${FUNCTION_META.find(f => f.id === selectedFunction)?.category})`
                        : "Choose a function..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search functions..." className="text-sm" />
                      <CommandList>
                        <CommandEmpty>No function found.</CommandEmpty>
                        <CommandGroup className="max-h-40 overflow-y-auto">
                          {FUNCTION_META.map((func) => (
                            <CommandItem
                              key={func.id}
                              value={func.id}
                             onSelect={() => {
                              setSelectedFunction(func.id)
                              setOpen(false)
                              setTestInputs(Array(func.numInputs).fill("")) // 👈 reset inputs
                            }}
                              className="flex justify-between"
                            >
                              <span>
                                {func.id}{" "}
                                <span className="text-muted-foreground">({func.category})</span>
                              </span>
                              {selectedFunction === func.id && (
                                <Check className="ml-auto h-4 w-4 opacity-70" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {FUNCTION_META.find(f => f.id === selectedFunction)?.numInputs &&
  testInputs.map((val, idx) => (
    <div key={idx}>
      <Label className="text-xs">Input {idx + 1}</Label>
      <Input
        value={val}
        onChange={(e) => {
          const newInputs = [...testInputs]
          newInputs[idx] = e.target.value
                      setTestInputs(newInputs)
                    }}
                    placeholder={`Enter value for input ${idx + 1}`}
                    className="mt-1"
                  />
                </div>
              ))}

             {lastTestOutput && (
                <div className="text-sm mt-2 p-3 rounded-md border dark:border-gray-600 bg-muted/30 dark:bg-muted/10">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-muted-foreground">Output</strong>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        lastTestOutput.startsWith("Error")
                          ? "text-red-600 border-red-400"
                          : "text-green-600 border-green-400"
                      )}
                    >
                      {lastTestOutput.startsWith("Error") ? "Error" : "Success"}
                    </Badge>
                  </div>
                  <pre className="text-md font-mono whitespace-pre-wrap break-words text-foreground">
                    {lastTestOutput}
                  </pre>
                </div>
              )}


             <Button
              onClick={runTest}
              disabled={
                !selectedFunction ||
                testInputs.length === 0 ||
                testInputs.some((val) => val.trim() === "") ||
                isLoading
              }
              className="w-full"
              size="sm"
            >
              {isLoading ? "Testing..." : "Run Test"}
            </Button>

            </CardContent>
          </Card>

          {/* Test History */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4" />
                Test History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No tests run yet
                </p>
              ) : (
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <div
                      key={test.id}
                      className="border rounded-lg p-3 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {test.function}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {test.timestamp}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Input:</span> {test.input}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Output:</span> {test.output}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-sm text-amber-800 dark:text-amber-300">
                💡 Discovery Hints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-amber-700 dark:text-amber-200 space-y-2">
                <p>• Try different input types (numbers, strings, arrays)</p>
                <p>• Look for patterns in the outputs</p>
                <p>• Test edge cases (empty inputs, special characters)</p>
                <p>• Chain functions to create complex operations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
