import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
          },
          testCases: true,
          submissions: true,
          teams: true,
        },
      });

      if (!question) throw new Error("NOT_FOUND");

      // Map leaderboard data
      const leaderboardData = await Promise.all(
        question.leaderboard.map(async (entry) => {
          const { submission, team } = entry;

          // Count how many submissions this team made for this question
          const submissionCount = await ctx.db.submission.count({
            where: {
              teamId: team.id,
              questionId: question.id,
            },
          });

          const passCount = submission.passedTestCases;
          const totalTestCases = submission.totalTestCases;
          const percentage = totalTestCases > 0 ? (passCount / totalTestCases) * 100 : 0;

          return {
            teamId: team.id,
            teamName: team.name,
            score: percentage,
            testCasesPassed: passCount,
            totalTestCases: totalTestCases,
            submissions: submissionCount,
            submissionId: submission.id,
            submissionTime: submission.createdAt.toISOString(),
            worksheet: submission.worksheet,
          };
        })
      );

      return {
        question: {
          title: question.title,
          description: question.description,
          code: question.code,
          difficulty: question.difficulty,
          startTime: question.startTime.toISOString(),
          endTime: question.endTime.toISOString(),
          totalTestCases: question.testCases.length,
          totalSubmissions: question.submissions.length,
          totalTeams: question.teams.length,
        },
        leaderboard: leaderboardData,
      };
    }),
});
