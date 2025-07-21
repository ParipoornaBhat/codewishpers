"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Search, X, CheckCircle, RefreshCw } from "lucide-react"
import { usePlaySettings } from "@/lib/stores/usePlaySettings"
import clsx from "clsx"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import { DateTime } from "luxon"
import { useQuestionStore } from "@/lib/stores/useQuestionStorage"
import {  XCircle, Loader2, Timer  } from "lucide-react"
import { useWorksheetStore } from "@/lib/stores/useWorksheetStore"
import { executeGraphAndCheckOutput } from "@/lib/testRunner"
import { FUNCTION_META } from "@/lib/functionMeta" // Importing the function metadata

 type HandleTestProps = {
  fnMutations: Record<string, any>
  updateNode?: (id: string, data: any) => void
}

 
type TestCase = {
  input: string
  expected: string
}

type QuestionData = {
  title: string
  description: string
  testCases: TestCase[]
  difficulty: string
  startTime?: string | null
  endTime?: string | null
  createdAt: string
  code: string
}

export default function QuestionCard() {
  const {
  testCases,
  testResults,
  setTestCases,
  setTestResults,
  updateTestResult,
  setTestLoading,
  testLoading,
  failedTestCase,
} = useQuestionStore()
// console.log("Current worksheet:", current)


  const { QuestionCardOpen: isOpen, setQuestionCardOpen: setIsOpen } = usePlaySettings()
  const [questionCode, setQuestionCode] = useState("")
  const [questionData, setQuestionData] = useState<QuestionData | null>(null)
const [now, setNow] = useState(DateTime.now().setZone("Asia/Kolkata"))


  const { mutate: selectQuestion, isPending } = api.question.questionselect.useMutation({
    onSuccess: (data) => {
      if (!data) {
        toast.error("Invalid Question Code!")
        return
      }
      setQuestionData(data)
      setTestCases(data.testCases) 
      toast.success("Question loaded successfully!")
    },
    onError: (err) => {
      toast.error(`Failed to load question: ${err.message}`)
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now().setZone("Asia/Kolkata"))

    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleQuestionSelection = () => {
    if (!questionCode.trim()) return
    selectQuestion({ code: questionCode.toUpperCase() })
  }

  const handleReset = () => {
  setQuestionData(null)
  setQuestionCode("")
  localStorage.removeItem("question-code")
}

const start = questionData?.startTime ? DateTime.fromISO(questionData.startTime).setZone("Asia/Kolkata") : null
const end = questionData?.endTime ? DateTime.fromISO(questionData.endTime).setZone("Asia/Kolkata") : null

 
  const notStarted = start && now < start
  const hasEnded = end && now > end

  const countdown = (target: DateTime) => {
    const dur = target.diff(now).shiftTo("hours", "minutes", "seconds").toObject()
    const pad = (n?: number) => String(Math.max(0, Math.floor(n ?? 0))).padStart(2, "0")
    return `${pad(dur.hours)}:${pad(dur.minutes)}:${pad(dur.seconds)}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-200 text-green-800"
      case "medium":
        return "bg-yellow-200 text-yellow-800"
      case "hard":
        return "bg-red-200 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }
  useEffect(() => {
    if (questionData?.testCases) {
      setTestResults(Array(questionData.testCases.length).fill(null));
    }
  }, [questionData?.testCases]);

const saveSubmission = async () => {
  const currentWorksheet = useWorksheetStore.getState().getCurrentWorksheet()
  if (!currentWorksheet) throw new Error("No worksheet found")

  const { testCases, testResults, failedTestCase } = useQuestionStore.getState()

  const passedCount = testResults.filter((res) => res === true).length
  const totalCount = testCases.length

  const timing = {
    submittedAt: DateTime.now().toISO(),
  }

  console.log("Submission timing:", timing)

  if (failedTestCase) {
    console.log(
      `${passedCount}/${totalCount} Passed. ❌ Failed at Input:`,
      failedTestCase.input,
      "Output:",
      failedTestCase.output ?? "null"
    )
  } else {
    console.log(`✅ ${passedCount}/${totalCount} Test Cases Passed.`)
  }

  // 🔒 Submission save logic can go here
}
const handleTest = async ({
  fnMutations,
  runVisible = true,
}: {
  fnMutations: any
  runVisible: boolean
}) => {
  const currentWorksheet = useWorksheetStore.getState().getCurrentWorksheet()
  if (!currentWorksheet) throw new Error("No worksheet found")

  const { worksheet } = currentWorksheet
  const { nodes, edges } = worksheet

  const {
    testCases,
    setTestResults,
    updateTestResult,
    setLoadingAt,
    setFailedTestCase,
  } = useQuestionStore.getState()

  // Helper function to run and log a test case
  const runTest = async (test: any, idx: number) => {
    try {
      setLoadingAt?.(idx, true)

      const { passed, result, intermediateSteps } =
        await executeGraphAndCheckOutput({
          nodes,
          edges,
          testInput: test.input,
          fnMutations,
        })

      // console.group(`Test #${idx + 1}`)
      // console.log("🟩 Input:", test.input)
      // console.log("✅ Expected Output:", test.expected)
      // console.log("🧠 Final Output:", result)
      // console.log("✔️ Passed:", passed)

      // if (intermediateSteps?.length) {
      //   intermediateSteps.forEach((step, i) => {
      //     console.log(`Step ${i + 1}:`)
      //     console.log("  Node ID:", step.nodeId)
      //     console.log("  Input:", step.input)
      //     console.log("  Output:", step.output)
      //   })
      // } else {
      //   console.log("No intermediate steps captured.")
      // }

      // console.groupEnd()
      updateTestResult(idx, false)
      return { passed, result }
    } catch (err) {
      console.error(`❌ Test #${idx + 1} failed:`, err)
      updateTestResult(idx, false)
      return { passed: false, result: null }
    } finally {
      setTimeout(() => setLoadingAt?.(idx, false), 100)
    }
  }

  const visibleIndexes = testCases
    .map((t, i) => (t.isVisible ? i : -1))
    .filter((i) => i !== -1)

  const hiddenIndexes = testCases
    .map((t, i) => (!t.isVisible ? i : -1))
    .filter((i) => i !== -1)

  // Set initial loading state
  const initialResults = Array(testCases.length).fill(null)
  const initialLoading = Array(testCases.length).fill(true)

  setTestResults(initialResults)
  useQuestionStore.getState().setTestLoading(initialLoading)

  // Run visible test cases in parallel
  const visiblePromises = visibleIndexes.map(async (idx) =>
    runTest(testCases[idx], idx).then((res) => res.passed),
  )
  const visibleResults = await Promise.all(visiblePromises)

  visibleIndexes.forEach((idx, i) => {
    updateTestResult(idx, visibleResults[i] ?? false)
  })

  if (runVisible) {
    {
      const updated: (boolean | null)[] = [...useQuestionStore.getState().testResults]
      visibleIndexes.forEach((idx: number, i: number) => (updated[idx] = visibleResults[i] ?? null))
      setTestResults(updated)
    }
    return
  }

  // Sequentially run hidden tests
  for (const idx of hiddenIndexes) {
    const test = testCases[idx]
    const { passed, result } = await runTest(test, idx)

    updateTestResult(idx, passed)
    if (!passed) {
      // Set failed test input/output and show toast
      setFailedTestCase({
        input: test?.input ?? "",
        output: result,
        originalIdx: idx,
        expected: test?.expected ?? "",
      })
      toast.error(`❌ Hidden Test Case #${idx + 1} Failed`)
      {
        const updated = [...useQuestionStore.getState().testResults]
        updated[idx] = false
        setTestResults(updated)
      }
      await saveSubmission() // still empty
      return
    }
  }

  // All passed

  toast.success("🎉 All test cases passed!")
  await saveSubmission()
}

 const fnMutations = Object.fromEntries(
  FUNCTION_META.map((meta) => [meta.id, (api.f as any)[meta.id].useMutation()])
)
const handleTestRun = async () => {
  await handleTest({ fnMutations, runVisible: true })
}
const handleSubmitCode = async () => {
    setClickedSubmit(true)
    updateSubmittedAt();
    await handleTest({ fnMutations, runVisible: false })
}

useEffect(() => {
  const savedCode = localStorage.getItem("question-code")
  if (savedCode) {
     const code = savedCode.toUpperCase()
    setQuestionCode(code)
    selectQuestion({ code }) 
  }
}, [])


  const passedCount = testResults.filter((r) => r === true).length
  const totalCount = testCases.length

  const allPassed = passedCount === totalCount
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)
  const [clickedSubmit, setClickedSubmit] = useState(false)
  const updateSubmittedAt = () => {
    const now = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss")
    setSubmittedAt(now)
  }
  return (
    <div
      className={clsx(
        "relative top-0 left-0 h-full z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto",
        isOpen ? "w-[520px]" : "w-10"
      )}
    >
      {isOpen ? (
        <Card className="h-full flex flex-col p-6">
          <CardHeader>
            <div className="absolute top-4 right-6 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={() => {
                  if (!questionData?.code) return
                  setClickedSubmit(false)
                  selectQuestion({ code: questionData.code })
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              Enter Question Code
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto">
            {!questionData ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="questionCode" className="text-lg">Question Code</Label>
                  <Input
                    id="questionCode"
                    value={questionCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setQuestionCode(value)
                      localStorage.setItem("question-code", value)
                    }}
                    placeholder="Q001"
                    className="text-md"
                  />

                </div>
                <Button
                  onClick={handleQuestionSelection}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-lg"
                  disabled={!questionCode.trim() || isPending}
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isPending ? "Loading..." : "Load Question"}
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-md">Code: {questionData.code}</p>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Change Code
                  </Button>
                </div>

                {notStarted ? (
                  <div className="text-center mt-6">
                    <h4 className="text-xl font-semibold">Event starts in:</h4>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {start && countdown(start)}
                    </p>
                  </div>
                ) : (
                  <>
                    {end && now < end && (
                      <div className="text-center mt-6">
                        <h4 className="text-xl font-semibold">Event ends in:</h4>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                          {countdown(end)}
                        </p>
                      </div>
                    )}
                    <Card className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold">{questionData.title}</h3>
                        <Badge className={getDifficultyColor(questionData.difficulty)}>
                          {questionData.difficulty}
                        </Badge>
                      </div>
                      <p className="text-base text-muted-foreground">{questionData.description}</p>
                      <div className="text-xs text-gray-500 space-y-1 pt-2">
                        <p>Created: {DateTime.fromISO(questionData.createdAt).toLocaleString(DateTime.DATETIME_MED)}</p>
                        <p>Start: {start?.toLocaleString(DateTime.DATETIME_MED) ?? "N/A"}</p>
                        <p>End: {end?.toLocaleString(DateTime.DATETIME_MED) ?? "N/A"}</p>
                      </div>
                      {hasEnded && (
                        <p className="text-red-600 font-bold text-sm">This event has ended.</p>
                      )}
                    </Card>

                    <div className="mt-6">
                    {/* Header row with title and button side by side */}
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">Visible Test Cases</h4>
                      <Button onClick={handleTestRun}>Run Test</Button>
                    </div>

                    {/* Test cases list */}
                    <div className="space-y-3">
                   {testCases
                      .map((tc, originalIdx) => ({ ...tc, originalIdx }))
                      .filter((tc) => tc.isVisible)
                      .map((tc) => (
                        <Card key={tc.originalIdx} className="p-4 flex flex-col gap-2 relative">
                          <p className="text-sm"><strong>Input:</strong> {tc.input}</p>
                          <p className="text-sm"><strong>Expected:</strong> {tc.expected}</p>

                          <div className="absolute top-2 right-2 text-xl">
                            {testLoading[tc.originalIdx] ? (
                              <Loader2 className="animate-spin w-5 h-5 text-black-500 dark:text-white-500" />
                            ) : testResults[tc.originalIdx] === true ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : testResults[tc.originalIdx] === false ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : null}
                          </div>
                        </Card>
                    ))}



                    </div>
                  </div>

   {clickedSubmit && (
     <>
       <div
         className={`mt-6 p-4 rounded-md border ${
           allPassed
             ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20"
             : "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20"
         }`}
       >
         <div className="flex items-center gap-2 mb-2">
           {allPassed ? (
             <>
               <CheckCircle className="text-green-600 dark:text-green-400" />
               <p className="text-green-800 dark:text-green-300 font-semibold">
                 {passedCount}/{totalCount} Test Cases Passed
               </p>
             </>
           ) : (
             <>
               <XCircle className="text-red-600 dark:text-red-400" />
               <p className="text-red-800 dark:text-red-300 font-semibold">
                 {passedCount}/{totalCount} Passed — Failed at Test Case #
                 {(failedTestCase?.originalIdx ?? 0) + 1}
               </p>
             </>
           )}
         </div>

         {!allPassed && failedTestCase && (
           <div className="text-sm text-red-700 dark:text-red-300 ml-6 space-y-1">
             <p>
               <strong>Input:</strong> {failedTestCase.input}
             </p>
             <p>
               <strong>Expected Output:</strong> {failedTestCase.expected}
             </p>
             <p>
               <strong>Your Output:</strong> {failedTestCase.output ?? "null"}
             </p>
           </div>
         )}

         <div className="text-sm text-green-700 dark:text-green-300 ml-6 flex items-center gap-2 mt-1">
           <Timer className="w-4 h-4" />
           <p>Submitted At: {submittedAt}</p>
         </div>
       </div>
     </>
   )}
                    <Button
                      variant="secondary"
                      className="w-full mt-6 text-lg"
                      disabled={!!hasEnded}
                      onClick={handleSubmitCode}
                    >
                      Submit Code
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
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
