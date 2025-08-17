import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const submissionRouter = createTRPCRouter({
  save: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        questionId: z.string(),
        worksheet: z.any(),
        passedTestCases: z.number(),
        totalTestCases: z.number(),
        allPassed: z.boolean().optional().default(false),
        failedTestCase: z
          .object({
            input: z.string(),
            expected: z.string(),
            output: z.string().nullable(),
            originalIdx: z.number(),
          })
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        teamId,
        questionId,
        worksheet,
        passedTestCases,
        totalTestCases,
        allPassed,
        failedTestCase,
      } = input;

      const existing = await ctx.db.submission.findMany({
        where: { teamId, questionId },
        orderBy: { createdAt: "asc" },
      });

      const passedSubs = existing.filter((s) => s.allPassed);
      const failedSubs = existing.filter((s) => !s.allPassed);
      const now = new Date();

      const createOrUpdate = async (target?: typeof existing[0]) => {
        if (target) {
          return ctx.db.submission.update({
            where: { id: target.id },
            data: {
              worksheet,
              passedTestCases,
              totalTestCases,
              allPassed,
              failedTestCases: failedTestCase ? [failedTestCase] : [],
              createdAt: now,
            },
          });
        }
        return ctx.db.submission.create({
          data: {
            teamId,
            questionId,
            worksheet,
            passedTestCases,
            totalTestCases,
            allPassed,
            failedTestCases: failedTestCase ? [failedTestCase] : [],
          },
        });
      };

      let saved: any;

      if (allPassed) {
        if (passedSubs.length < 5) {
          saved = await createOrUpdate();
        } else {
          const sortedPassed = [...passedSubs].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
          const slot = sortedPassed[1];
          saved = await createOrUpdate(slot);
        }
      } else {
        const sorted = failedSubs.sort((a, b) => {
          if (b.passedTestCases !== a.passedTestCases)
            return b.passedTestCases - a.passedTestCases;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        if (failedSubs.length < 5) {
          saved = await createOrUpdate();
        } else {
          const lastSorted = sorted[sorted.length - 1];
          const minPassed = lastSorted ? lastSorted.passedTestCases : 0;
          const leastPassed = sorted.filter(
            (s) => s.passedTestCases === minPassed
          );

          let slot: typeof existing[0] | undefined;

          if (leastPassed.length >= 2) {
            slot = leastPassed[1]; // 2nd oldest among the least passed
          } else {
            slot = leastPassed[0]; // fallback to the only one
          }

          saved = await createOrUpdate(slot);
        }
      }

      const code = `SUB-${saved.id.toString().padStart(4, "0")}`;
      const updated = await ctx.db.submission.update({
        where: { id: saved.id },
        data: { submissionCode: code },
      });

      // ✅ Leaderboard check — use best of existing fetched submissions
      const bestExisting = existing.reduce((best, curr) => {
        if (!best) return curr;
        return curr.passedTestCases > best.passedTestCases ? curr : best;
      }, null as typeof existing[0] | null);

      const isBetter =
        !bestExisting || updated.passedTestCases > bestExisting.passedTestCases;

      if (isBetter) {
  // First, upsert leaderboard entry (your existing code)
  const lbEntry = await ctx.db.leaderboardEntry.upsert({
    where: {
      teamId_questionId: { teamId, questionId },
    },
    update: {
      submissionId: updated.id,
      updatedAt: new Date(),
    },
    create: {
      teamId,
      questionId,
      submissionId: updated.id,
    },
  });

  // Fetch question points config
  const questionData = await ctx.db.question.findUnique({
    where: { id: questionId },
    select: {
      winner: true,
      runnerUp: true,
      secondRunnerUp: true,
      participant: true,
    },
  });
  if (!questionData) throw new Error(`Question not found for ID: ${questionId}`);

  // Fetch all leaderboard entries for this question, including submission stats
  const allEntries = await ctx.db.leaderboardEntry.findMany({
    where: { questionId },
    include: {
      submission: true,
    },
  });

  // Sort by passedTestCases desc, then by submittedAt asc
  allEntries.sort((a, b) => {
    if (b.submission.passedTestCases !== a.submission.passedTestCases) {
      return b.submission.passedTestCases - a.submission.passedTestCases;
    }
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  // Assign ranks & points based on sorted order
    const updates = allEntries.map((entry, index) => {
      const hasPassedAny = entry.submission.passedTestCases > 0;

      let rank: number | null = null;
      let points = 0;

      if (hasPassedAny) {
        rank = index + 1;

        if (rank === 1) points = questionData.winner;
        else if (rank === 2) points = questionData.runnerUp;
        else if (rank === 3) points = questionData.secondRunnerUp;
        else points = questionData.participant;
      }

      return ctx.db.leaderboardEntry.update({
        where: { id: entry.id },
        data: {
          rank,
          points,
        },
      });
    });


  // Run updates in parallel
  await Promise.all(updates);

  // Continue your socket emit code...
  const question = await ctx.db.question.findUnique({
    where: { id: questionId },
    select: { code: true },
  });
  if (!question) throw new Error(`Question not found for ID: ${questionId}`);

  console.log(`📣 Emitting leaderboard update for question: ${question.code}`);
  try {
    const res = await fetch(`${process.env.SOCKET_URL}/emit-leaderboard-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: "overall" }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No response body");
      console.log(
        `❌ Failed to emit leaderboard update: ${res.status} ${res.statusText} - ${errorText}`
      );
    } else {
      console.log("✅ Leaderboard update emitted successfully");
    }
  } catch (error: any) {
    console.warn("🚨 Failed to connect to socket server:", error.message || error);
  }
} else {
  console.log("⏩ Submission saved but not better — leaderboard not updated");
}

      return updated;
    }),
});
