"use client"

import { Handle, Position } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, AlertTriangle } from "lucide-react"

interface OutputNodeProps {
  data: {
    label: string
    value: any
  }
}

export default function OutputNode({ data }: OutputNodeProps) {
  const hasValue = data.value !== null && data.value !== undefined

  return (
    <div className="relative">
   <Handle
  type="target"
  position={Position.Left}
  isConnectableEnd={true}
  className="
    !w-2.5 !h-2.5 rounded-full
    bg-green-500 border-2 border-white
    dark:bg-green-400 dark:border-slate-900
    hover:bg-green-600 dark:hover:bg-green-300
    transition-colors duration-200
    shadow-sm
  "
/>


      <Card className="w-64 bg-green-50 border-green-300 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-green-600" />
            <Badge variant="outline" className="text-xs text-green-700 border-green-300 font-semibold">
              Final Result
            </Badge>
          </div>

          <div className="space-y-3">
            {hasValue ? (
              <div className="bg-white p-3 rounded-md border border-green-200 shadow-sm">
                <div className="text-xs text-green-600 font-medium mb-1">Output Value:</div>
                <div className="text-xl font-mono text-green-800 font-bold">{String(data.value)}</div>
                <div className="text-xs text-green-500 mt-1">Type: {typeof data.value}</div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-md border border-gray-300 text-center shadow-sm">
                <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-xs text-gray-500 italic">Connect functions to see the final result</div>
              </div>
            )}

            {/* Connection Warning */}
            <div className="p-2 bg-amber-50 rounded-md border border-amber-300 mt-3">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <div className="text-xs text-amber-700">Only one connection allowed</div>
              </div>
            </div>
          </div>

          {hasValue && (
            <div className="mt-3 p-2 bg-green-100 rounded-md border border-green-200">
              <div className="text-xs text-green-700 text-center font-medium">🎉 Chain Complete!</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
