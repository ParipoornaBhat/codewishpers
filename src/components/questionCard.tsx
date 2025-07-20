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

  return (
    <div
      className={clsx(
        "relative top-0 left-0 h-full z-50 transition-all duration-300 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg",
        isOpen ? "w-[520px]" : "w-10"
      )}
    >
      {isOpen ? (
        <Card className="h-full flex flex-col p-6">
          <CardHeader>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={() => {
                  if (!questionData?.code) return
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
                    onChange={(e) => setQuestionCode(e.target.value.toUpperCase())}
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
                      <h4 className="font-semibold text-lg mb-2">Visible Test Cases</h4>
                      <div className="space-y-3">
                        {questionData.testCases.map((tc, idx) => (
                          <Card key={idx} className="p-4 flex flex-col gap-2">
                            <p className="text-sm"><strong>Input:</strong> {tc.input}</p>
                            <p className="text-sm"><strong>Expected:</strong> {tc.expected}</p>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full mt-6 text-lg"
                      disabled={!!hasEnded}
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
        <div className="h-full flex flex-col justify-center items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
