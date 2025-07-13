import { useState } from "react"
import { Handle, Position } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react" // Spinner icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react"

import { FUNCTION_META } from "@/lib/functionMeta"

interface FunctionNodeProps {
  id: string
  data: {
    id: string
    name: string
    operation: string
    category: string
    description: string
    result: any
    input: any | any[]   // now supports single or multiple inputs
    onDelete?: (nodeId: string) => void
    inputCount?: number  // number of connected inputs passed from parent
    loading?: boolean // indicates if the function is currently processing
  }
}

export default function FunctionNode({ id, data }: FunctionNodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get metadata
  const meta = FUNCTION_META.find((fn) => fn.id === data.id)
  const IconComponent = meta?.icon
  const description = data.description?.trim() || meta?.description?.trim() || "No description available"
  const category = meta?.category || "Unknown"
  const inputTypes = meta?.inputTypes || []
  const outputType = meta?.outputType || "unknown"
  const maxInputs = meta?.numInputs ?? 1

  // Determine actual inputs (support array or single value)
  const inputsArray = Array.isArray(data.input) ? data.input : data.input !== undefined && data.input !== null ? [data.input] : []
  const inputCount = data.inputCount ?? inputsArray.length

  const hasOutput = data.result !== null && data.result !== undefined
  const hasEnoughInputs = inputCount >= maxInputs
  const hasAnyInput = inputCount > 0

  // Status icon (Output / No Input)

const getStatusIcon = () => {
  if (data.loading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-yellow-500 dark:text-yellow-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs max-w-xs text-muted-foreground dark:text-gray-300">
              {description}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const isProcessed = hasOutput
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
              isProcessed
                ? "text-green-600 dark:text-green-300"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {isProcessed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {isProcessed
              ? "Output"
              : !hasAnyInput
              ? "No Input"
              : `Needs ${maxInputs} input${maxInputs > 1 ? "s" : ""}`}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs max-w-xs text-muted-foreground dark:text-gray-300">
            {description}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="
          !w-2.5 !h-2.5 rounded-full
          bg-purple-500 dark:bg-purple-400
          border-2 border-white dark:border-gray-900
          hover:bg-purple-600 dark:hover:bg-purple-300
          transition-colors duration-200 shadow-sm
        "
      />

      {/* Node Card */}
      <Card
        className={`w-72 transition-all duration-200 ${
          isHovered ? "shadow-md" : "shadow-md"
        } ${hasOutput ? "ring-2 ring-green-200 dark:ring-green-600/40" : ""}`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              {IconComponent && <IconComponent className="w-4 h-4 text-primary" />}
              <span className="text-muted-foreground dark:text-gray-300">{category}</span>
            </Badge>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    <span className="sr-only">Node options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => data.onDelete?.(id)}
                    className="text-red-600 dark:text-red-400 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Node
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Name / ID */}
          <div className="flex items-center mb-1 gap-1">
            <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100">
              {data.id}
            </h3>
          </div>

          {/* ID and Types */}
          <div className="text-[11px] text-muted-foreground dark:text-gray-400 mb-2 flex flex-row gap-2">
            <span>
              <span className="font-semibold">ID:</span> {data.id}
            </span>
            <span>
              <span className="font-semibold">Input:</span> {inputTypes.join(", ")}
            </span>
            <span>
              <span className="font-semibold">Output:</span> {outputType}
            </span>
          </div>

          {/* Input/Output Display */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              {/* Input(s) */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Input value{maxInputs > 1 ? "s" : ""}
                </div>
                {(() => {
  const inputsArray = Array.isArray(data.input)
    ? data.input
    : data.input !== undefined && data.input !== null
      ? [data.input]
      : [];


  return inputCount === 0 ? (
    <div className="text-xs p-2 rounded border font-mono bg-muted border-muted text-muted-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500">
      No input
    </div>
  ) : (
    inputsArray.map((inputVal, idx) => (
      <div
        key={idx}
        className="text-xs p-2 mb-1 rounded border font-mono bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
      >
        {String(inputVal)}
      </div>
    ))
  );
})()}

              </div>

              {/* Arrow if processed */}
              {hasAnyInput && hasOutput && (
                <ArrowRight className="w-4 h-4 text-purple-500 dark:text-purple-300 flex-shrink-0 mt-4" />
              )}

              {/* Output */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Output value
                </div>
                <div
                  className={`text-xs p-2 rounded border font-mono ${
                    hasOutput
                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300"
                      : "bg-muted border-muted text-muted-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500"
                  }`}
                >
                  {hasOutput ? String(data.result) : "No output"}
                </div>
              </div>
            </div>
          </div>

          {/* Alert if inputs not enough */}
          {!hasEnoughInputs && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded border border-red-300 dark:border-red-700">
              <div className="text-xs text-red-700 dark:text-red-400 text-center font-medium">
                ⚠️ This function requires {maxInputs} input{maxInputs > 1 ? "s" : ""}.{" "}
                {inputCount} provided.
              </div>
            </div>
          )}

          {/* Processed Indicator */}
          {hasAnyInput && hasOutput && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-950 rounded border border-green-200 dark:border-green-700">
              <div className="text-xs text-green-700 dark:text-green-300 text-center font-medium">
                ✓ Processed
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="
          !w-2.5 !h-2.5 rounded-full
          bg-purple-500 dark:bg-purple-400
          border-2 border-white dark:border-gray-900
          hover:bg-purple-600 dark:hover:bg-purple-300
          transition-colors duration-200 shadow-sm
        "
      />
    </div>
  )
}
