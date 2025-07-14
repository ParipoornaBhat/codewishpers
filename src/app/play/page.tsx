"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Play, Save, Download } from "lucide-react"
import WorksheetCanvas from "@/components/worksheet-canvas"
import FunctionLibrary from "@/components/function-library"
import TestPanel from "@/components/test-panel"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Worksheet {
  id: string
  name: string
  nodes: any[]
  edges: any[]
}

export default function CodeWhispersApp() {
  const [autoSave, setAutoSave] = useState(true)

  const [worksheets, setWorksheets] = useState<Worksheet[]>([])

  const [activeWorksheet, setActiveWorksheet] = useState<string | null>(null)
  const [showTestPanel, setShowTestPanel] = useState(false)
  
  const extractWorksheetsFromLocalStorage = (): Worksheet[] => {
  const result: Worksheet[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("worksheet-")) {
      const id = key.replace("worksheet-", "")
      result.push({
        id,
        name: `Worksheet ${id}`,
        nodes: [],
        edges: [],
      })
    }
  }

  return result.sort((a, b) => Number(a.id) - Number(b.id))
}
useEffect(() => {
  const saved = extractWorksheetsFromLocalStorage()

  if (saved.length > 0) {
    setWorksheets(saved)
    if (saved[0]) {
      setActiveWorksheet(saved[0].id)
    }
  } else {
    // Create default one
    const newId = "1";
    const defaultWorksheet = {
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
    setWorksheets([defaultWorksheet])
    setActiveWorksheet(newId)
  }
}, [])


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
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 rounded-md shadow-md">
            <Label htmlFor="autosave-switch" className="text-sm text-gray-700 dark:text-gray-200">
              Auto-Save
            </Label>
            <Switch
              id="autosave-switch"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
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
          {activeWorksheet && (
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
                    autoSave={autoSave}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
          )}
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
