import { create } from "zustand"

type TestCase = {
  input: string
  expected: string
  isVisible: boolean
}

type FailedTestCase = {
  input: string
  output: string 
  expected: string
  originalIdx: number
} | null


type QuestionStore = {
  testCases: TestCase[]
  testResults: (boolean | null)[]
  testLoading: boolean[]
  failedTestCase: FailedTestCase

  setTestCases: (cases: TestCase[]) => void
  setTestResults: (results: (boolean | null)[]) => void
  setTestLoading: (loading: boolean[]) => void
  updateTestResult: (index: number, result: boolean) => void
  setLoadingAt: (index: number, value: boolean) => void
  setFailedTestCase: (test: FailedTestCase) => void
}

export const useQuestionStore = create<QuestionStore>((set) => ({
  testCases: [],
  testResults: [],
  testLoading: [],
  failedTestCase: null,

 setTestCases: (cases) =>
  set({
    testCases: cases.map((c) => ({
      ...c,
      isVisible: c.isVisible ?? true, // only default to true if it's missing
    })),
    testResults: Array(cases.length).fill(null),
    testLoading: Array(cases.length).fill(false),
    failedTestCase: null,
  }),

  setTestResults: (results) => set({ testResults: results }),
  setTestLoading: (loading) => set({ testLoading: loading }),
  updateTestResult: (index, result) =>
    set((state) => {
      const updated = [...state.testResults]
      updated[index] = result
      return { testResults: updated }
    }),
  setLoadingAt: (index, value) =>
    set((state) => {
      const updated = [...state.testLoading]
      updated[index] = value
      return { testLoading: updated }
    }),
  setFailedTestCase: (test) => set({ failedTestCase: test }),
}))
