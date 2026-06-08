"use client";

import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";
import { localFunctions, parseInput, formatOutput } from "@/lib/localFunctions";
import { QuestionMeta, QuestionCode } from "@/lib/QuestionMeta";
import { FUNCTION_META, R1_FUNCTION_META } from "@/lib/functionMeta";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/api/root";

// Seed local storage with default questions if empty
const getLocalQuestions = () => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("codewhispers-questions");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  // Pre-seed from QuestionMeta
  const seeded = QuestionMeta.map((q, index) => {
    const paddedNumber = String(index + 1).padStart(3, "0");
    const code = `Q${paddedNumber}`;
    return {
      id: `q_${code}`,
      code,
      number: index + 1,
      title: q.title === "Question" ? `Challenge ${index + 1}` : q.title,
      description: q.description,
      difficulty: q.difficulty,
      startTime: q.startTime ? q.startTime.toISOString() : null,
      endTime: q.endTime ? q.endTime.toISOString() : null,
      createdAt: new Date().toISOString(),
      testCases: q.testCases.map((tc, tcIdx) => ({
        id: `tc_${code}_${tcIdx}`,
        input: tc.input,
        expected: tc.expected,
        isVisible: tc.isVisible ?? true,
      })),
      winner: q.winner ?? 10,
      runnerUp: q.runnerUp ?? 5,
      secondRunnerUp: q.secondRunnerUp ?? 3,
      participant: q.participant ?? 1,
    };
  });
  localStorage.setItem("codewhispers-questions", JSON.stringify(seeded));
  return seeded;
};

const getLocalSubmissions = (questionCode: string) => {
  if (typeof window === "undefined") return [];
  const key = `codewhispers-subs-${questionCode}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [];
};

// Seed mock opponent data for leaderboards
const MOCK_OPPONENTS = [
  { teamId: "team_wizards", teamName: "Code Wizards", basePoints: 240, scores: { Q001: 100, Q002: 80, Q003: 100, Q004: 60 } },
  { teamId: "team_rangers", teamName: "Recursion Rangers", basePoints: 185, scores: { Q001: 80, Q002: 100, Q003: 70, Q005: 90 } },
  { teamId: "team_bosses", teamName: "Bit Bosses", basePoints: 130, scores: { Q001: 50, Q003: 90, Q004: 80, Q006: 70 } },
  { teamId: "team_cache", teamName: "Cache Money", basePoints: 95, scores: { Q002: 60, Q004: 100, Q007: 80 } },
  { teamId: "team_alchemists", teamName: "Array Alchemists", basePoints: 50, scores: { Q001: 40, Q005: 80 } }
];

// React Query Mock Hooks
function useMockQuery(path: string[], input: any) {
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    setIsLoading(true);
    const domain = path[0];
    const method = path[1];

    if (domain === "question" && method === "getAll") {
      const qList = getLocalQuestions();
      // compute totals
      const formatted = qList.map((q: any) => {
        const subs = getLocalSubmissions(q.code);
        const passRate = subs.length === 0 ? 0 : Math.round((subs.filter((s: any) => s.allPassed).length / subs.length) * 100);
        return {
          ...q,
          submissions: subs.length,
          passRate,
        };
      });
      setData(formatted);
    } else if (domain === "leaderboard") {
      if (method === "getLeaderboard") {
        const questionCode = input?.questionCode || "Q001";
        const qList = getLocalQuestions();
        const question = qList.find((q: any) => q.code === questionCode) || qList[0];
        
        // Get user submissions
        const userSubs = getLocalSubmissions(questionCode);
        const bestUserSub = userSubs.reduce((best: any, curr: any) => {
          if (!best) return curr;
          return curr.passedTestCases > best.passedTestCases ? curr : best;
        }, null);

        // Build leaderboard entries
        const entries: any[] = [];

        // 1. Add user if they submitted
        if (bestUserSub) {
          const passCount = bestUserSub.passedTestCases;
          const total = bestUserSub.totalTestCases;
          const pct = total > 0 ? (passCount / total) * 100 : 0;
          entries.push({
            teamId: "team_guest",
            teamName: localStorage.getItem("mock_session_teamName") || "Resume Guest",
            score: pct,
            testCasesPassed: passCount,
            totalTestCases: total,
            submissions: userSubs.length,
            submissionId: bestUserSub.id,
            submissionTime: bestUserSub.createdAt,
            worksheet: bestUserSub.worksheet,
            rank: 1, // temporary placeholder
            points: question.winner,
          });
        }

        // 2. Add mock opponents
        MOCK_OPPONENTS.forEach((opp, i) => {
          const passPct = opp.scores[questionCode as keyof typeof opp.scores] || 0;
          if (passPct > 0) {
            const totalCases = question.testCases.length;
            const passedCases = Math.round((passPct / 100) * totalCases);
            entries.push({
              teamId: opp.teamId,
              teamName: opp.teamName,
              score: passPct,
              testCasesPassed: passedCases,
              totalTestCases: totalCases,
              submissions: 2,
              submissionId: `opp_sub_${opp.teamId}_${questionCode}`,
              submissionTime: new Date(Date.now() - 3600000 * (i + 1)).toISOString(),
              worksheet: {},
              rank: 1, // temporary placeholder
              points: 0,
            });
          }
        });

        // Sort: score desc, submissionTime asc
        entries.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime();
        });

        // Assign ranks and points
        entries.forEach((entry, idx) => {
          entry.rank = idx + 1;
          if (entry.rank === 1) entry.points = question.winner;
          else if (entry.rank === 2) entry.points = question.runnerUp;
          else if (entry.rank === 3) entry.points = question.secondRunnerUp;
          else entry.points = question.participant;
        });

        setData({
          question: {
            title: question.title,
            description: question.description,
            code: question.code,
            difficulty: question.difficulty,
            startTime: question.startTime || new Date().toISOString(),
            endTime: question.endTime || new Date().toISOString(),
            totalTestCases: question.testCases.length,
            totalSubmissions: entries.length * 2,
            totalTeams: entries.length,
          },
          leaderboard: entries,
        });
      } else if (method === "getOverallLeaderboard") {
        // Overall leaderboard
        const qList = getLocalQuestions();
        const userTeamsMap = new Map<string, any>();

        // Init mock opponents
        MOCK_OPPONENTS.forEach(opp => {
          userTeamsMap.set(opp.teamId, {
            teamId: opp.teamId,
            teamName: opp.teamName,
            totalPoints: opp.basePoints,
            questionStats: [],
            overallRank: 0
          });
        });

        // Init current user team
        const userName = localStorage.getItem("mock_session_teamName") || "Resume Guest";
        userTeamsMap.set("team_guest", {
          teamId: "team_guest",
          teamName: userName,
          totalPoints: 0,
          questionStats: [],
          overallRank: 0
        });

        // Compute actual user points based on localStorage submissions
        qList.forEach((q: any) => {
          const userSubs = getLocalSubmissions(q.code);
          const bestUserSub = userSubs.reduce((best: any, curr: any) => {
            if (!best) return curr;
            return curr.passedTestCases > best.passedTestCases ? curr : best;
          }, null);

          // Build scores comparison table
          const qEntries: any[] = [];
          if (bestUserSub) {
            const pct = q.testCases.length > 0 ? (bestUserSub.passedTestCases / q.testCases.length) * 100 : 0;
            qEntries.push({ teamId: "team_guest", score: pct, time: bestUserSub.createdAt });
          }

          MOCK_OPPONENTS.forEach(opp => {
            const passPct = opp.scores[q.code as keyof typeof opp.scores] || 0;
            if (passPct > 0) {
              qEntries.push({ teamId: opp.teamId, score: passPct, time: new Date(Date.now() - 50000000).toISOString() });
            }
          });

          // Sort entries to determine ranks/points for this question
          qEntries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.time).getTime() - new Date(b.time).getTime();
          });

          qEntries.forEach((entry, idx) => {
            const rank = idx + 1;
            let pts = 0;
            if (rank === 1) pts = q.winner;
            else if (rank === 2) pts = q.runnerUp;
            else if (rank === 3) pts = q.secondRunnerUp;
            else pts = q.participant;

            const teamObj = userTeamsMap.get(entry.teamId);
            if (teamObj) {
              if (entry.teamId === "team_guest") {
                teamObj.totalPoints += pts;
              }
              teamObj.questionStats.push({
                questionId: q.id,
                questionCode: q.code,
                questionTitle: q.title,
                score: entry.score,
                testCasesPassed: Math.round((entry.score / 100) * q.testCases.length),
                totalTestCases: q.testCases.length,
                points: pts,
                rankInQuestion: rank,
              });
            }
          });
        });

        const leaderboardData = Array.from(userTeamsMap.values());
        leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
        leaderboardData.forEach((team, idx) => {
          team.overallRank = idx + 1;
        });

        setData(leaderboardData);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(input)]);

  return {
    data,
    isLoading,
    isFetching: false,
    refetch: fetchData,
  };
}

function useMockMutation(path: string[], options?: any) {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (input: any) => {
    setIsPending(true);
    // Simulate networking delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const domain = path[0];
    const method = path[1];

    if (!domain || !method) {
      return { success: false, error: "Invalid tRPC path" };
    }

    let result: any = { success: true };

    try {
      if (domain === "f" || domain === "r1") {
        // execute visual function
        const fnId = method;
        const logicFn = localFunctions[fnId];
        if (!logicFn) {
          throw new Error(`Function ${fnId} not implemented client-side`);
        }

        // Find inputs type mapping if available
        // Note: localFunctions takes pre-parsed arguments but in testRunner we pass raw inputs.
        // Let's implement dynamic procedure parser here to align with backend:
        const allMetaList = [...FUNCTION_META, ...R1_FUNCTION_META];
        const targetMeta = allMetaList.find((m: any) => m.id === fnId);
        
        if (!targetMeta) {
          throw new Error(`Meta not found for ${fnId}`);
        }

        const inputValues = targetMeta.inputTypes.map((type: any, i: number) => {
          const raw = input[i] ?? "";
          if (type === "any") {
            try {
              return JSON.parse(raw);
            } catch {
              return raw;
            }
          }
          return parseInput(raw, type);
        });

        const output = logicFn(...inputValues);
        
        if (output && typeof output === "object" && "success" in output && output.success === false) {
          result = output;
        } else {
          result = {
            success: true,
            result: formatOutput(output, targetMeta.outputType || "any"),
          };
        }
      } else if (domain === "question") {
        const qList = getLocalQuestions();
        if (method === "questionselect") {
          const code = input.code.toUpperCase();
          const question = qList.find((q: any) => q.code === code);
          if (!question) {
            result = { success: false, message: `Question Code ${code} not found.` };
          } else {
            const subs = getLocalSubmissions(code);
            result = {
              id: question.id,
              title: question.title,
              description: question.description,
              testCases: question.testCases,
              difficulty: question.difficulty,
              startTime: question.startTime,
              endTime: question.endTime,
              createdAt: question.createdAt,
              code: question.code,
              submissions: subs,
            };
          }
        } else if (method === "create") {
          const paddedNumber = String(qList.length + 1).padStart(3, "0");
          const finalCode = `Q${paddedNumber}`;
          const newQuestion = {
            id: `q_${finalCode}`,
            code: finalCode,
            number: qList.length + 1,
            title: input.title,
            description: input.description,
            difficulty: input.difficulty,
            startTime: input.startTime ? input.startTime.toISOString() : null,
            endTime: input.endTime ? input.endTime.toISOString() : null,
            createdAt: new Date().toISOString(),
            testCases: input.testCases.map((tc: any, tcIdx: number) => ({
              id: `tc_${finalCode}_${tcIdx}`,
              input: tc.input,
              expected: tc.expected,
              isVisible: tc.isVisible ?? true,
            })),
            winner: input.winner ?? 10,
            runnerUp: input.runnerUp ?? 5,
            secondRunnerUp: input.secondRunnerUp ?? 3,
            participant: input.participant ?? 1,
          };
          qList.push(newQuestion);
          localStorage.setItem("codewhispers-questions", JSON.stringify(qList));
          result = newQuestion;
        } else if (method === "update") {
          const index = qList.findIndex((q: any) => q.id === input.id);
          if (index !== -1) {
            const current = qList[index];
            qList[index] = {
              ...current,
              ...input,
              testCases: input.testCases ? input.testCases.map((tc: any, tcIdx: number) => ({
                id: tc.id || `tc_${current.code}_${tcIdx}`,
                input: tc.input,
                expected: tc.expected,
                isVisible: tc.isVisible ?? true,
              })) : current.testCases,
            };
            localStorage.setItem("codewhispers-questions", JSON.stringify(qList));
            result = qList[index];
          }
        } else if (method === "delete") {
          const filtered = qList.filter((q: any) => q.id !== input.id);
          localStorage.setItem("codewhispers-questions", JSON.stringify(filtered));
          result = { success: true };
        } else if (method === "reset") {
          const q = qList.find((q: any) => q.id === input.id);
          if (q) {
            localStorage.removeItem(`codewhispers-subs-${q.code}`);
          }
          result = { success: true };
        } else if (method === "resetDB") {
          localStorage.removeItem("codewhispers-questions");
          QuestionCode.forEach(code => {
            localStorage.removeItem(`codewhispers-subs-${code}`);
          });
          getLocalQuestions(); // triggers re-seeding
          result = { success: true };
        }
      } else if (domain === "submission" && method === "save") {
        const { questionId, worksheet, passedTestCases, totalTestCases, allPassed, failedTestCase } = input;
        
        // Find question code
        const qList = getLocalQuestions();
        const question = qList.find((q: any) => q.id === questionId || q.code === questionId);
        const code = question ? question.code : questionId;

        const subs = getLocalSubmissions(code);
        const now = new Date();

        const newSub = {
          id: subs.length + 1,
          passedTestCases,
          totalTestCases,
          createdAt: now.toISOString(),
          allPassed,
          failedTestCases: failedTestCase ? [failedTestCase] : [],
          submissionCode: `SUB-${String(subs.length + 1).padStart(4, "0")}`,
          worksheet,
        };

        // Enforce maximum 5 submissions (replaces older ones if matching database strategy)
        if (subs.length < 5) {
          subs.push(newSub);
        } else {
          // Replace the oldest one
          subs.shift();
          subs.push(newSub);
        }

        localStorage.setItem(`codewhispers-subs-${code}`, JSON.stringify(subs));
        result = newSub;
      }

      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err: any) {
      if (options?.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = (input: any) => {
    mutateAsync(input).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending,
  };
}

// Recursive Proxy to intercept tRPC router call hooks
function createRecursiveProxy(callback: (path: string[], args: any[]) => any, path: string[] = []): any {
  const proxyFn = function() {};
  return new Proxy(proxyFn, {
    get(target, prop) {
      if (typeof prop === "string") {
        return createRecursiveProxy(callback, [...path, prop]);
      }
      return Reflect.get(target, prop);
    },
    apply(target, thisArg, args) {
      return callback(path, args);
    }
  });
}

// Main api object proxy mapping
export const api = createRecursiveProxy((path, args) => {
  const last = path[path.length - 1];

  if (last === "useQuery") {
    const apiPath = path.slice(0, -1);
    const input = args[0];
    return useMockQuery(apiPath, input);
  }

  if (last === "useMutation") {
    const apiPath = path.slice(0, -1);
    const options = args[0];
    return useMockMutation(apiPath, options);
  }

  if (path[0] === "useUtils" || path[0] === "useContext") {
    // Return mock utils invalidate
    return createRecursiveProxy((subPath, subArgs) => {
      return {
        invalidate: () => {},
      };
    });
  }

  return undefined;
}) as ReturnType<typeof createTRPCReact<AppRouter>>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
