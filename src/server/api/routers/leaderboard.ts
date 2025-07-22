import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"

export const leaderboardRouter = createTRPCRouter({
    getLeaderboard: publicProcedure
  .input(z.object({ questionCode: z.string() }))
  .query(async ({ ctx, input }) => {
    const question = await ctx.db.question.findUnique({
      where: { code: input.questionCode },
      include: {
        leaderboard: {
          include: {
            team: true,
            submission: true,
          },
          orderBy: { rank: "asc" },
        },
      },
    });

    if (!question) throw new Error("NOT_FOUND");

    return {
      questionTitle: question.title,
      leaderboard: question.leaderboard.map((entry) => {
        const passCount = entry.submission.passedTestCases;
        const totalTestCases = entry.submission.totalTestCases;
        const percentage = totalTestCases > 0 ? (passCount / totalTestCases) * 100 : 0;
        return {
          rank: entry.rank,
          teamName: entry.team.name,
          score: percentage,
          testCasesPassed: passCount,
          totalTestCases: totalTestCases,
          submissions: 1, // optional: fetch count if needed
          submissionTime: entry.submission.createdAt.toISOString(),
        };
      }),
    };
  }),

  
})
