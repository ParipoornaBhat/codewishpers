"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Play, History, Lightbulb } from "lucide-react"

interface TestPanelProps {
  worksheet: any
  onClose: () => void
}

export default function TestPanel({ worksheet, onClose }: TestPanelProps) {
  const [selectedFunction, setSelectedFunction] = useState("")
  const [testInput, setTestInput] = useState("")
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const mockFunctions = [
    "Square",
    "Cube",
    "Add 10",
    "Subtract 5",
    "Multiply by 2",
    "Divide by 3",
    "Is Even",
    "Is Odd",
    "Is Prime",
    "Absolute",
    "Square Root",
    "Power of 2",
    "Factorial",
    "Double",
    "Half",
    "Negate",
    "Add 1",
    "Subtract 1",
    "Modulo 10",
    "Is Positive",
  ]

  const runTest = async () => {
    if (!selectedFunction || !testInput) return

    setIsLoading(true)

    // Mock API call with actual function operations
    setTimeout(() => {
      const input = Number.parseFloat(testInput)
      let mockResult = "Error"

      // Simple operation mapping for testing
      switch (selectedFunction) {
        case "Square":
          mockResult = `Result: ${input * input}`
          break
        case "Cube":
          mockResult = `Result: ${input * input * input}`
          break
        case "Add 10":
          mockResult = `Result: ${input + 10}`
          break
        case "Subtract 5":
          mockResult = `Result: ${input - 5}`
          break
        case "Multiply by 2":
          mockResult = `Result: ${input * 2}`
          break
        case "Is Even":
          mockResult = `Result: ${input % 2 === 0}`
          break
        case "Is Odd":
          mockResult = `Result: ${input % 2 !== 0}`
          break
        case "Absolute":
          mockResult = `Result: ${Math.abs(input)}`
          break
        default:
          mockResult = `Result: ${input + 1}`
      }

      const newTest = {
        id: Date.now(),
        function: selectedFunction,
        input: testInput,
        output: mockResult,
        timestamp: new Date().toLocaleTimeString(),
      }

      setTestHistory((prev) => [newTest, ...prev])
      setIsLoading(false)
      setTestInput("")
    }, 1000)
  }

  const runWorksheet = () => {
    // Execute the entire worksheet chain
    console.log("Running worksheet:", worksheet?.name)
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
          {/* Individual Function Testing */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4" />
                Test Individual Function
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Select Function</Label>
                <select
                  value={selectedFunction}
                  onChange={(e) => setSelectedFunction(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md text-sm bg-background dark:bg-gray-900 dark:border-gray-600"
                >
                  <option value="">Choose a function...</option>
                  {mockFunctions.map((func) => (
                    <option key={func} value={func}>
                      {func}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Test Input</Label>
                <Input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter test input..."
                  className="mt-1"
                />
              </div>

              <Button
                onClick={runTest}
                disabled={!selectedFunction || !testInput || isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading ? "Testing..." : "Run Test"}
              </Button>
            </CardContent>
          </Card>

          {/* Worksheet Execution */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Execute Worksheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Run the entire function chain in {worksheet?.name}</p>
              <Button onClick={runWorksheet} className="w-full" size="sm">
                Execute Chain
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
                <p className="text-xs text-muted-foreground text-center py-4">No tests run yet</p>
              ) : (
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <div key={test.id} className="border rounded-lg p-3 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {test.function}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{test.timestamp}</span>
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

          {/* Insights */}
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-sm text-amber-800 dark:text-amber-300">💡 Discovery Hints</CardTitle>
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
