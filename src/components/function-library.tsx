"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ActivityIcon as Function, Hash } from "lucide-react"
import { FUNCTION_META } from "@/lib/functionMeta" // Importing the function metadata
import { CATEGORIES } from "@/lib/functionMeta" // Importing categories
// Real function data with simple mathematical operations


export default function FunctionLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const getDisplayName = (id: string) => {
    const num = parseInt(id.replace(/\D/g, ""))
    return `Function #${num}`
  }

  const filteredFunctions = FUNCTION_META.filter((func) => {
    const matchesSearch = getDisplayName(func.id).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || func.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const onDragStart = (event: React.DragEvent, func: any) => {
  event.dataTransfer.setData("application/reactflow", "function")
  event.dataTransfer.setData(
    "application/json",
    JSON.stringify({
      ...func,
      operation: func.id, // ✅ Ensures operation is set for tRPC mutation lookup
    })
  )
  event.dataTransfer.effectAllowed = "move"
}


  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Function Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search functions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Function List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredFunctions.map((func) => {
            const IconComponent = func.icon
            const displayName = getDisplayName(func.id)

            return (
              <Card
                key={func.id}
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
                          {func.category}
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
  )
}
