"use client"

import { Handle, Position } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { Play } from "lucide-react"
import { SOLUTION_FUNCTIONS } from "@/lib/functionMeta"
import { api } from "@/trpc/react"

interface InputNodeProps {
  data: {
    label: string
    value: string
    result?: number | string | null
  }
  id: string
}

export default function InputNode({ data, id }: InputNodeProps) {
  const [expectedOutput, setExpectedOutput] = useState<number | string | null>(null)
  const [value, setValue] = useState(data.value || "")

  const questionCode = useMemo(() => localStorage.getItem("question-code") || "", [])
  const matchedFn = SOLUTION_FUNCTIONS.find((fn) => fn.questionCode === questionCode)

  const dynamicMutation = matchedFn
    ? api.f[matchedFn.id as keyof typeof api.f].useMutation()
    : null

  useEffect(() => {
    if (!matchedFn || !dynamicMutation || !value || isNaN(Number(value))) {
      setExpectedOutput(null)
      return
    }

    const inputNumber = Number(value)
    dynamicMutation.mutate([inputNumber] as any, {
      onSuccess: (result: any) => {
        setExpectedOutput(result)
      },
      onError: (err: any) => {
        console.error("Expected output fetch failed", err)
      },
    })

    data.value = value
    data.result = inputNumber
  }, [value])

  useEffect(() => {
    if (value && !isNaN(Number(value))) {
      data.value = value
      data.result = Number(value)
    }
  }, [value, data])

  return (
    <div className="w-64 min-h-[200px] border border-blue-300 dark:border-blue-700 shadow-md bg-blue-50 dark:bg-slate-900 rounded-md overflow-hidden">
      <Card className="w-full h-full shadow-none border-none bg-transparent">
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div>
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Initial Input
              </Label>
            </div>

            {/* Input Field */}
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number..."
              className="text-sm border border-blue-400 dark:border-blue-600 focus:border-blue-600 dark:focus:border-blue-400 rounded-md p-2 bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-4">
            {/* If input is valid */}
            {value && !isNaN(Number(value)) ? (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-blue-200 dark:border-blue-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-300">
                    Current Input:
                  </div>
                </div>
                <div className="text-lg font-mono text-blue-800 dark:text-blue-100 mt-1">{value}</div>

                {/* Show expected output or fallback */}
                {matchedFn ? (
                  expectedOutput !== null && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900 rounded-md border border-green-300 dark:border-green-600 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Play className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <div className="text-xs font-medium text-green-600 dark:text-green-300">
                          Expected Output:
                        </div>
                      </div>
                      <div className="text-lg font-mono text-green-800 dark:text-green-100 mt-1">
                        {expectedOutput}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 rounded-md border border-yellow-300 dark:border-yellow-600 shadow-sm">
                    <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                      No question is set properly.
                    </div>
                  </div>
                )}
              </div>
            ) : value && isNaN(Number(value)) ? (
              <div className="p-3 bg-red-50 dark:bg-red-900 rounded-md border border-red-300 dark:border-red-600 shadow-sm">
                <div className="text-xs font-medium text-red-600 dark:text-red-400">Invalid Input:</div>
                <div className="text-sm text-red-800 dark:text-red-300 mt-1">Please enter a valid number.</div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 text-center">
                Waiting for input...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 rounded-full bg-cyan-500 border-2 border-white dark:bg-cyan-400 dark:border-slate-900 hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors duration-200 shadow-sm"
      />
    </div>
  )
}
