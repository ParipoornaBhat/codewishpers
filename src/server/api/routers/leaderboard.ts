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

    // Map leaderboard data with rank and points
    let leaderboardData = await Promise.all(
      question.leaderboard.map(async (entry) => {
        const { submission, team, rank, points } = entry;

        // Count how many submissions this team made for this question
        const submissionCount = await ctx.db.submission.count({
          where: {
            teamId: team.id,
            questionId: question.id,
          },
        });

        const passCount = submission.passedTestCases;
        const totalTestCases = submission.totalTestCases;
        const percentage =
          totalTestCases > 0 ? (passCount / totalTestCases) * 100 : 0;

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
          rank: rank ?? null,
          points: points ?? null,
        };
      })
    );

    // Sort only by rank (nulls go last)
    leaderboardData = leaderboardData.sort((a, b) => {
      if (a.rank == null && b.rank == null) return 0;
      if (a.rank == null) return 1; // unranked goes last
      if (b.rank == null) return -1;
      return a.rank - b.rank;
    });


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

  getOverallLeaderboard: publicProcedure
  .query(async ({ ctx }) => {
    const teams = await ctx.db.team.findMany({
      include: {
        leaderboard: {
          include: {
            question: true,
            submission: true,
          },
        },
      },
    });

    const leaderboardData = teams.map((team) => {
      let totalPoints = 0;

      const questionStats = team.leaderboard.map((entry) => {
        const passCount = entry.submission.passedTestCases;
        const totalTestCases = entry.submission.totalTestCases;
        const percentage =
          totalTestCases > 0 ? (passCount / totalTestCases) * 100 : 0;

        const points = entry.points ?? 0;
        totalPoints += points;

        return {
          questionId: entry.question.id,
          questionCode: entry.question.code,
          questionTitle: entry.question.title,
          score: percentage,
          testCasesPassed: passCount,
          totalTestCases: totalTestCases,
          points: points,
          rankInQuestion: entry.rank ?? null, // rank from LeaderboardEntry
        };
      });

      return {
        teamId: team.id,
        teamName: team.name,
        totalPoints,
        questionStats,
        overallRank: 0, // Placeholder, will be updated below
      };
    });

    // Sort by total points descending
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Optional: assign overall ranks
    leaderboardData.forEach((team, idx) => {
      team.overallRank = idx + 1;
    });

    return leaderboardData;
  }),

});
