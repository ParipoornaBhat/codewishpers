"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Play, Save, Download , XIcon} from "lucide-react"
import WorksheetCanvas from "@/components/worksheet-canvas"
import FunctionLibrary from "@/components/function-library"
import QuestionCard from "@/components/questionCard"
import TestPanel from "@/components/test-panel"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import clsx from "clsx";
import { usePlaySettings } from "@/lib/stores/usePlaySettings";
interface Worksheet {
  id: string
  name: string
  nodes: any[]
  edges: any[]
}

export default function CodeWhispersApp() {
  

const { autoSave, setAutoSave, showTestPanel, setShowTestPanel, isLibFunctionsOpen, QuestionCardOpen } = usePlaySettings();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])

  const [activeWorksheet, setActiveWorksheet] = useState<string | null>(null)

  
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
  // Find the maximum ID among current worksheets
  const maxId = worksheets.reduce((max, ws) => {
    const num = parseInt(ws.id, 10);
    return num > max ? num : max;
  }, 0);

  const newId = (maxId + 1).toString();

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
  };

  setWorksheets([...worksheets, newWorksheet]);
  setActiveWorksheet(newId);
};


  const updateWorksheet = useCallback((id: string, nodes: any[], edges: any[]) => {
    setWorksheets((prev) => prev.map((ws) => (ws.id === id ? { ...ws, nodes, edges } : ws)))
  }, [])

  const currentWorksheet = worksheets.find((ws) => ws.id === activeWorksheet)
const removeWorksheet = (id: string) => {
  localStorage.removeItem(`worksheet-${id}`)

  const updated = worksheets.filter(ws => ws.id !== id)
  setWorksheets(updated)

  // If active worksheet was deleted, switch to the first one or null
  if (activeWorksheet === id) {
    if (updated.length > 0 && updated[0]) {
      setActiveWorksheet(updated[0].id)
    } else {
      setActiveWorksheet(null)
    }
  }

  // Optional: reload the page if you want a full refresh
  // location.reload()
}


  return (
    <div className="h-[calc(100vh-100px)] sm:h-[calc(100vh-80px)] lg:h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}

      <div className="flex-1 flex">
        {/* Function Library Sidebar & Question Card */}
        <div
          className={clsx(
            "relative top-0 left-0 h-[calc(100vh-70px)] z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg",
            QuestionCardOpen ? "w-[500px]" : "w-10"
          )}
        >
          <QuestionCard />
        </div>
        <div
          className={clsx(
    "relative top-0 left-0 h-[calc(100vh-70px)] z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg",
    isLibFunctionsOpen ? "w-[300px]" : "w-10"
  )}
>
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
                <TabsTrigger
                  key={worksheet.id}
                  value={worksheet.id}
                  className="px-4 flex items-center gap-2 group relative"
                >
                  {worksheet.name}
                  {worksheets.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        removeWorksheet(worksheet.id)
                      }}
                      className="ml-1 text-red-500 hover:text-red-700 transition cursor-pointer opacity-100 group-hover:opacity-50"
                      title="Close"
                    >
                      <XIcon className="w-4 h-4" />
                    </span>
                  )}
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
  <div className="absolute right-0 top-[70px] z-[9998] w-96 h-[calc(100vh-70px)] bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-lg">
    <TestPanel worksheet={currentWorksheet} onClose={() => setShowTestPanel(false)} />
  </div>
)}

      </div>
    </div>
  )
}
