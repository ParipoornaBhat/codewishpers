"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle, ChevronDown, ChevronUp, PlusIcon, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { JsonValue } from "@prisma/client/runtime/library"
import { usePlaySettings } from "@/lib/stores/usePlaySettings"
import { useMemo } from "react"

type Submission = {
  id: number
  createdAt: string | Date
  submissionCode: string | null
  passedTestCases: number
  totalTestCases: number
  allPassed: boolean
  failedTestCases: JsonValue
  worksheet: JsonValue
}

export function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  const { showSubmissions, toggleSubmissions } = usePlaySettings()

  const sorted = useMemo(() => {
    return [...submissions].sort((a, b) => {
      if (b.passedTestCases !== a.passedTestCases) {
        return b.passedTestCases - a.passedTestCases
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [submissions])
  type WorksheetData = {
   
  nodes: any[];
  edges: any[];
};

const handleAddWorksheet = (id: number, worksheet: WorksheetData) => {
  const key = `worksheet-sol${id}`;
  const dataToStore = {
    nodes: worksheet.nodes,
    edges: worksheet.edges,
  };

  localStorage.setItem(key, JSON.stringify(dataToStore));
  window.location.reload();

};


  return (
<Card
  className={cn(
    "sticky bottom-0 left-0 w-full max-w-md mx-auto shadow-lg border overflow-auto",
    "transition-all duration-300 ease-in-out",
    showSubmissions ? "h-[40vh]" : "h-[40px] overflow-hidden"
  )}
>
  <CardHeader
  onClick={() => toggleSubmissions && toggleSubmissions(!showSubmissions)}
  className="sticky top-0 z-10 flex items-center justify-center cursor-pointer hover:bg-muted px-4 py-3 border-b bg-background flex-row"
>
  <CardTitle className="text-base font-semibold">Submission History</CardTitle>
  {showSubmissions ? (
    <ChevronDown className="w-5 h-5 text-muted-foreground" />
  ) : (
    <ChevronUp className="w-5 h-5 text-muted-foreground" />
  )}
</CardHeader>


  {/* Scrollable inner content */}
  <div
    className={cn(
      "overflow-y-auto transition-opacity duration-300",
      showSubmissions ? "opacity-100" : "opacity-0 pointer-events-none"
    )}
  >
    <CardContent className="space-y-3 p-4">
      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        sorted.map((submission) => {
          const {
            id,
            createdAt,
            submissionCode,
            passedTestCases,
            totalTestCases,
            allPassed,
            failedTestCases,
          } = submission

          return (
            <Card
              key={id}
              className={cn(
                "transition-shadow p-2 space-y-1",
                allPassed
                  ? "border-green-600 dark:border-green-900"
                  : "border-red-600 dark:border-red-900"
              )}
            >
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-1 pb-0">
                <div className="flex items-center justify-between w-full text-sm md:text-base font-semibold">
                  <span>{submissionCode ?? "Unnamed Submission"}</span>
                  <span>{format(new Date(createdAt), "dd/MM/yy | hh:mm:ss a")}</span>
                  <span>
                    {passedTestCases} / {totalTestCases}
                  </span>
                </div>
                {allPassed ? (
                  <CheckCircle className="text-green-600 dark:text-green-900 w-5 h-5" />
                ) : (
                  <XCircle className="text-red-600 dark:text-red-900 w-5 h-5" />
                )}
                <Button
  onClick={() => {
    if (submission.worksheet) {
      handleAddWorksheet(
        submission.id,
       (submission.worksheet as any).worksheet
      );
        } else {
      console.warn("No worksheet data available for submission:", submission.id);
    }
  }}
  className="text-xs rounded bg-slate-900 text-white hover:bg-slate-700 w-1"
>
  <PlusIcon className="w-2 h-2" />
</Button>


              </CardHeader>

              {!allPassed &&
                Array.isArray(failedTestCases) &&
                failedTestCases.length > 0 && (
                  <CardContent className="pt-1 pb-2">
                    <span className="font-semibold text-sm">Failed Cases:</span>
                    <div className="mt-1 space-y-2">
                      {(failedTestCases as any[]).map((tc, index) => (
                        <div
                          key={index}
                          className="bg-muted px-3 py-2 rounded text-sm border border-muted-foreground"
                        >
                          <div className="flex gap-1">
                            <span className="font-medium">Input:</span>
                            <span>{tc.input}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                              <span className="font-medium">Expected Output:</span>
                              <span className="ml-1">{tc.expected}</span>
                            </div>
                            <div>
                              <span className="font-medium">Your Output:</span>
                              <span className="ml-1">{tc.output}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Test case #{tc.originalIdx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
            </Card>
          )
        })
      )}
    </CardContent>
  </div>
</Card>

  )
}
