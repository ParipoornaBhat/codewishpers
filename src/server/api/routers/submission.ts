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
          // Replace the second oldest passed submission
          const sortedPassed = [...passedSubs].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
          const slot = sortedPassed[1]; // second oldest
          saved = await createOrUpdate(slot);
        }
      } else {
        const sorted = failedSubs.sort((a, b) => {
          if (b.passedTestCases !== a.passedTestCases)
            return b.passedTestCases - a.passedTestCases;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        const higher = sorted.find((s) => s.passedTestCases > passedTestCases);
        if (higher || failedSubs.length < 5) {
          saved = await createOrUpdate();
        } else {
          const tied = sorted.filter((s) => s.passedTestCases === passedTestCases);
          let slot: typeof existing[0] | undefined;

          if (tied.length < 2 && failedSubs.length < 5) {
            saved = await createOrUpdate();
          } else {
            slot = tied[1] || sorted[1];
            saved = await createOrUpdate(slot);
          }
        }
      }

      const code = `SUB-${saved.id.toString().padStart(4, "0")}`;
      const updated = await ctx.db.submission.update({
        where: { id: saved.id },
        data: { submissionCode: code },
      });

      return updated;
    }),
});
