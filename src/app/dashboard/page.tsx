"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ViewEditQuestion from "@/app/dashboard/components/viewEdit"
import { Search, Users, Edit, XCircle, PencilIcon, MoreVertical } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { RotateCcw } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/_components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem  } from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/_components/ui/select"
import Link from "next/link"
import { motion } from "framer-motion"
import { z } from "zod"
import { Button } from "@/app/_components/ui/button"
import { ComponentLoading } from "../_components/component-loading"
import { Label } from "@/app/_components/ui/label"
import { Badge } from "@/app/_components/ui/badge"
import { Textarea } from "@/app/_components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff,PlusCircle, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { nanoid } from "nanoid"
import { api } from "@/trpc/react"
type SortOption = "createdAt-asc" | "createdAt-desc"

const QUESTIONS_PER_PAGE = 6

const getDifficultyColor = (difficulty: string) => {
  if (difficulty === "Easy") return "bg-green-100 text-green-800"
  if (difficulty === "Medium") return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

const getPassRateColor = (rate: number) => {
  if (rate >= 80) return "text-green-600"
  if (rate >= 50) return "text-yellow-600"
  return "text-red-600"
}

const Page = () => {
  const [viewEdit, SetViewEdit] = useState(false)
  const utils = api.useUtils()
const { mutate: deleteQuestion, isPending: isDeleting } = api.question.delete.useMutation({
  onSuccess: () => {
    toast.success("Question deleted!")
    utils.question.getAll.invalidate() // Refresh question list
  },
  onError: () => {
    toast.error("Failed to delete question.")
  }
})
const { mutate: resetQuestion, isPending: isResetting } = api.question.reset.useMutation({
  onSuccess: () => {
    toast.success("Question reset!")
    utils.question.getAll.invalidate() // Refresh question list
  },
  onError: () => {
    toast.error("Failed to reset question.")
  }
})
const { mutate: reset5Question, isPending: isResetting5 } = api.question.resetDB.useMutation({
  onSuccess: () => {
    toast.success("Question reset!")
    utils.question.getAll.invalidate() // Refresh question list
  },
  onError: () => {
    toast.error("Failed to reset question.")
  }
})
  const [questionData, setQuestionData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    questionCode: "",
    startTime: "",
    endTime: "",
    winner: 0, // default values
    runnerUp: 0,
    secondRunnerUp: 0,
    participant: 0,
  })

  const [testCases, setTestCases] = useState([
    { id: nanoid(), input: "", expectedOutput: "", isVisible: true },
  ])

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { id: nanoid(), input: "", expectedOutput: "", isVisible: true },
    ])
  }

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id))
  }

  const updateTestCase = (id: string, key: string, value: any) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [key]: value } : tc))
    )
  }



  const { mutate: createQuestion, isPending } = api.question.create.useMutation({
    onSuccess: () => {
      toast.success("Question created successfully!")
      setQuestionData({
        title: "",
        description: "",
        difficulty: "Easy",
        questionCode: "",
        startTime: "",
        endTime: "",
        winner: 0, // reset to default
        runnerUp: 0,
        secondRunnerUp: 0,
        participant: 0,
      })
      setTestCases([{ id: nanoid(), input: "", expectedOutput: "", isVisible: true }])
      window.location.reload() // Refresh the page to show new question
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.")
    },
  })

  const handleCreateQuestion = () => {
  

    createQuestion({
      title: questionData.title,
      description: questionData.description,
      difficulty: questionData.difficulty,
      startTime: questionData.startTime ? new Date(questionData.startTime) : undefined,
      endTime: questionData.endTime ? new Date(questionData.endTime) : undefined,
      winner: questionData.winner,
      runnerUp: questionData.runnerUp,
      secondRunnerUp: questionData.secondRunnerUp,
      participant: questionData.participant,
      testCases: testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expectedOutput,
        isVisible: tc.isVisible,
      })),
    })
  }

  const visibleCount = testCases.filter((tc) => tc.isVisible).length
  const hiddenCount = testCases.length - visibleCount
  const { data: allQuestions = [], isLoading } = api.question.getAll.useQuery()

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("createdAt-desc")
  const [page, setPage] = useState(1)

  const filteredQuestions = useMemo(() => {
    let q = [...allQuestions]

    // Search
    if (search.trim()) {
      q = q.filter((question) =>
        question.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort
    if (sort === "createdAt-asc") {
      q.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      q.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return q
  }, [allQuestions, search, sort])

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE)
  const paginatedQuestions = filteredQuestions.slice(
    (page - 1) * QUESTIONS_PER_PAGE,
    page * QUESTIONS_PER_PAGE
  )
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }
  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
  }

  const [viewEditQuestionId, setViewEditQuestionId] = useState<string | null>(null)

  return (

   <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50 dark:from-teal-900 dark:via-purple-900 dark:to-orange-900">
      <motion.div
        className="flex flex-col gap-2 p-2 md:p-6 pt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

      {/* Top Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 py-2">
  {/* Search Bar */}
  <div className="relative w-full">
    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search questions..."
      className="pl-10 h-12 text-base bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900 dark:to-purple-900 border-2 border-input focus:border-primary rounded-md shadow-sm"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value)
        setPage(1)
      }}
    />
  </div>
        <Button onClick={() => reset5Question()}>
    <RotateCcw className="h-4 w-4 mr-2" />
    Reset 5 Questions
        </Button>
  {/* Sort Dropdown */}
  <div className="w-full md:w-auto">
    <Select
      value={sort}
      onValueChange={(v) => {
        setSort(v as SortOption)
        setPage(1)
      }}
    >
      <SelectTrigger className="h-12 w-full md:w-[180px] text-base border-2 border-input focus:border-primary rounded-md shadow-sm bg-background">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc">New → Old</SelectItem>
        <SelectItem value="createdAt-asc">Old → New</SelectItem>
      </SelectContent>
    </Select>
    
  </div>
  <Dialog>
      <DialogTrigger asChild>
         <Button
      size="sm"
      className="h-10 gap-1 bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow transition-transform duration-200 hover:scale-[1.03] hover:shadow-md"
    >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Question
          </span>
        </Button>
      </DialogTrigger>

  <DialogContent aria-describedby={undefined}
    className="w-full h-full sm:max-w-[95vw] md:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-teal-50 to-purple-50 dark:from-teal-900 dark:to-purple-900 p-4 sm:rounded-xl"
  >
        <DialogHeader>
          <DialogTitle className="text-teal-700 dark:text-teal-300">
            Create New Question
          </DialogTitle>
          <DialogDescription>
            Fill in the details to Create a new Question.
          </DialogDescription>
        </DialogHeader>

       <div className="w-full mx-auto px-4 py-6 space-y-6">
      {/* Question Details */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Question Title</Label>
              <Input
                id="title"
                value={questionData.title}
                onChange={(e) => setQuestionData({ ...questionData, title: e.target.value })}
                placeholder="Enter question title"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={questionData.difficulty}
                onChange={(e) => setQuestionData({ ...questionData, difficulty: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={questionData.description}
              onChange={(e) => setQuestionData({ ...questionData, description: e.target.value })}
              placeholder="Describe the problem and what participants need to achieve"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={questionData.startTime}
                onChange={(e) => setQuestionData({ ...questionData, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={questionData.endTime}
                onChange={(e) => setQuestionData({ ...questionData, endTime: e.target.value })}
              />
            </div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="winner">Winner Points</Label>
              <Input
                id="winner"
                type="number"
                value={questionData.winner}
                onChange={(e) =>
                  setQuestionData({ ...questionData, winner: Number(e.target.value) })
                }
                placeholder="Enter winner points"
                min={0}
              />
            </div>
          <div>
    <Label htmlFor="runnerUp">Runner-Up Points</Label>
    <Input
      id="runnerUp"
      type="number"
      value={questionData.runnerUp}
      onChange={(e) =>
        setQuestionData({ ...questionData, runnerUp: Number(e.target.value) })
      }
      placeholder="Enter runner-up points"
      min={0}
    />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="secondRunnerUp">Second Runner-Up Points</Label>
            <Input
              id="secondRunnerUp"
              type="number"
              value={questionData.secondRunnerUp}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  secondRunnerUp: Number(e.target.value),
                })
              }
              placeholder="Enter second runner-up points"
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="participant">Participant Points</Label>
            <Input
              id="participant"
              type="number"
              value={questionData.participant}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  participant: Number(e.target.value),
                })
              }
              placeholder="Enter participant points"
              min={0}
            />
          </div>
        </div>

        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Cases</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Define input/output pairs for testing solutions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>{visibleCount} visible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <EyeOff className="w-4 h-4 text-gray-500" />
                <span>{hiddenCount} hidden</span>
              </div>
              <Button onClick={addTestCase} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Test Case
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testCases.map((testCase, index) => (
            <div key={testCase.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Test Case {index + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testCase.isVisible}
                      onCheckedChange={(checked) => updateTestCase(testCase.id, "isVisible", checked)}
                    />
                    <Label className="text-sm">
                      {testCase.isVisible ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Eye className="w-3 h-3" />
                          Visible to users
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </span>
                      )}
                    </Label>
                  </div>
                </div>
                {testCases.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTestCase(testCase.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Input</Label>
                  <Input
                    value={testCase.input}
                    onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                    placeholder="Enter input value"
                  />
                </div>
                <div>
                  <Label>Expected Output</Label>
                  <Input
                    value={testCase.expectedOutput}
                    onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                    placeholder="Enter expected output"
                  />
                </div>
              </div>
            </div>
          ))}


        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            handleCreateQuestion()
          }}
        >
          {isPending ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </div>
      </DialogContent>
    </Dialog>
</div>


      {/* Cards Grid */}
      {isLoading ? (
       <ComponentLoading message="Loading questions..." />
      ) : (
        <>
          {paginatedQuestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No questions found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {paginatedQuestions.map((question) => {
    const visibleTestCases = question.testCases.filter(tc => tc.isVisible).length
    const totalTestCases = question.testCases.length
    const passRate = question.passRate ?? 0

    return (
      <div key={question.id} className="flex flex-col gap-2">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{question.title}</CardTitle>
                <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </Badge>
              </div>
              <Badge variant="outline" className="ml-2 font-mono">{question.code}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {question.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>{visibleTestCases} visible</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-gray-500" />
                  <span>{totalTestCases - visibleTestCases} hidden</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{question.submissions} submissions</span>
              </div>
            </div>

            <div className="flex justify-end">
              <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="bg-transparent">
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Actions</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-40">
    {/* View/Edit */}
    <DropdownMenuItem onClick={() => setViewEditQuestionId(question.id)}>
      <PencilIcon className="h-4 w-4 mr-2" />
      View/Edit
    </DropdownMenuItem>

    {/* Leaderboard */}
    <DropdownMenuItem asChild>
      <Link href={`/dashboard/${question.code}/leaderboard`}>
        <Users className="h-4 w-4 mr-2" />
        Leaderboard
      </Link>
    </DropdownMenuItem>

    {/* Delete */}
    <DropdownMenuItem
      onClick={() => {
        if (confirm("Are you sure you want to delete this question?")) {
          deleteQuestion({ id: question.id });
        }
      }}
    >
      <XCircle className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>

    {/* Reset */}
    <DropdownMenuItem
      onClick={() => {
        if (confirm("Are you sure you want to reset this question?")) {
          resetQuestion({ id: question.id });
        }
      }}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      Reset
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

{/* Dialog outside Dropdown */}
{viewEditQuestionId && (
  <Dialog open={true} onOpenChange={() => setViewEditQuestionId(null)}>
    <DialogContent
      aria-describedby={undefined}
      className="w-full h-full sm:max-w-[95vw] md:max-w-[80vw] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-teal-50 to-purple-50 dark:from-teal-900 dark:to-purple-900 p-4 sm:rounded-xl"
    >
      <DialogHeader>
        <DialogTitle className="text-teal-700 dark:text-teal-300">
          Question
        </DialogTitle>
        <DialogDescription>Question Details</DialogDescription>
      </DialogHeader>
      <ViewEditQuestion
        questionId={viewEditQuestionId}
        close={() => setViewEditQuestionId(null)}
      />
    </DialogContent>
  </Dialog>
)}

            </div>


            <div className="text-xs text-gray-500 pt-2 border-t">
              Created: {new Date(question.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        
      </div>
    );
  })}
</div>

          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
    </div>
  )
}

export default Page
