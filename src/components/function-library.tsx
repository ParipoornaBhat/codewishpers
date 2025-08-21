"use client"

import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, ChevronRight } from "lucide-react"
import { FUNCTION_META } from "@/lib/functionMeta"
import clsx from "clsx"
import { usePlaySettings } from "@/lib/stores/usePlaySettings"
export default function FunctionLibrary() {
  const { isLibFunctionsOpen: isOpen, setIsLibFunctionsOpen: setIsOpen } = usePlaySettings()
  const [searchTerm, setSearchTerm] = useState("")

  const getDisplayName = (fc: string) => {
    const num = parseInt(fc.replace(/\D/g, ""))
    return `Function #${num}`
  }

const filteredFunctions = FUNCTION_META
  .filter(func =>
    typeof func.id === "string" &&
    func.id.startsWith("fn") &&
    getDisplayName(func.id).toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    const numA = parseInt(a.fc.replace("fn", ""), 10);
    const numB = parseInt(b.fc.replace("fn", ""), 10);
    return numA - numB;
  });



  const onDragStart = (event: React.DragEvent, func: any) => {
    event.dataTransfer.setData("application/reactflow", "function")
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        ...func,
        operation: func.id,
      })
    )
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
  className={clsx(
    "relative top-0 left-0 h-full z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg",
    isOpen ? "w-[300px]" : "w-10"
  )}
>

      {isOpen ? (
        <div className="h-full flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Function Library</h2>
            <button
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search functions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Function List */}
<ScrollArea className="flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent scrollbar-rounded-md">
              <div className="space-y-2 pr-2">
              {filteredFunctions.map((func) => {
                const IconComponent = func.icon
                const displayName = getDisplayName(func.fc)

                return (
                  <Card
                    key={func.fc}
                    className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-[1.02] dark:bg-gray-700 dark:border-gray-600"
                    draggable
                    onDragStart={(event) => onDragStart(event, func)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{displayName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Unknown
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">{func.numInputs} input(s)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Drag functions to the canvas to start building your solution chain!
            </p>
          </div>
        </div>
      ) : (
        <div
  className="h-full flex flex-col justify-center items-center cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white"
  onClick={() => setIsOpen(true)}
>
  <ChevronRight className="w-6 h-6" />
</div>

      )}
    </div>
  )
}
