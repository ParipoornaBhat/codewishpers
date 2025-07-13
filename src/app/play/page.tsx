"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Play, Save, Download } from "lucide-react"
import WorksheetCanvas from "@/components/worksheet-canvas"
import FunctionLibrary from "@/components/function-library"
import TestPanel from "@/components/test-panel"

interface Worksheet {
  id: string
  name: string
  nodes: any[]
  edges: any[]
}

export default function CodeWhispersApp() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([
    {
      id: "1",
      name: "Worksheet 1",
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 200 },
          data: { label: "Input", value: "" },
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 800, y: 200 },
          data: { label: "Output", value: null },
        },
      ],
      edges: [],
    },
  ])
  const [activeWorksheet, setActiveWorksheet] = useState("1")
  const [showTestPanel, setShowTestPanel] = useState(false)

  const addWorksheet = () => {
    const newId = (worksheets.length + 1).toString()
    const newWorksheet = {
      id: newId,
      name: `Worksheet ${newId}`,
      nodes: [
        {
          id: `input-${newId}`,
          type: "input",
          position: { x: 100, y: 200 },
          data: { label: "Input", value: "" },
        },
        {
          id: `output-${newId}`,
          type: "output",
          position: { x: 800, y: 200 },
          data: { label: "Output", value: null },
        },
      ],
      edges: [],
    }
    setWorksheets([...worksheets, newWorksheet])
    setActiveWorksheet(newId)
  }

  const updateWorksheet = useCallback((id: string, nodes: any[], edges: any[]) => {
    setWorksheets((prev) => prev.map((ws) => (ws.id === id ? { ...ws, nodes, edges } : ws)))
  }, [])

  const currentWorksheet = worksheets.find((ws) => ws.id === activeWorksheet)

  return (
    <div className="h-[calc(100vh-100px)] sm:h-[calc(100vh-80px)] lg:h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CodeWhispers Round 2
            </h1>
            <div className="text-sm text-muted-foreground">Visual Function Chaining Challenge</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTestPanel(!showTestPanel)}>
              <Play className="w-4 h-4 mr-2" />
              Test Functions
            </Button>
            
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Function Library Sidebar */}
       <div className="w-80 h-[calc(100vh-130px)] overflow-y-auto bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm">
  <FunctionLibrary />
</div>


        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Worksheet Tabs */}
          <Tabs value={activeWorksheet} onValueChange={setActiveWorksheet} className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
              <div className="flex items-center gap-2">
                {/* Changed TabsList to flex with overflow-x-auto */}
                <TabsList className="flex w-auto overflow-x-auto whitespace-nowrap">
                  {worksheets.map((worksheet) => (
                    <TabsTrigger key={worksheet.id} value={worksheet.id} className="px-4">
                      {worksheet.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button variant="ghost" size="sm" onClick={addWorksheet} className="ml-2">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Canvas Content */}
            <div className="flex-1 relative">
              {worksheets.map((worksheet) => (
                <TabsContent key={worksheet.id} value={worksheet.id} className="h-full m-0 p-0">
                  <WorksheetCanvas
                    worksheetId={worksheet.id}
                    initialNodes={worksheet.nodes}
                    initialEdges={worksheet.edges}
                    onUpdate={updateWorksheet}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* Test Panel */}
        {showTestPanel && (
          <div className="w-96 h-[calc(100vh-130px)] bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-sm">
            <TestPanel worksheet={currentWorksheet} onClose={() => setShowTestPanel(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
