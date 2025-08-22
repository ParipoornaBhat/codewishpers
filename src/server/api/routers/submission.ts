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
      return await ctx.db.$transaction(async (db) => {
              const {
        teamId,
        questionId,
        worksheet,
        passedTestCases,
        totalTestCases,
        allPassed,
        failedTestCase,
      } = input;

      const existing = await db.submission.findMany({
        where: { teamId, questionId },
        orderBy: { createdAt: "asc" },
      });

      const passedSubs = existing.filter((s) => s.allPassed);
      const failedSubs = existing.filter((s) => !s.allPassed);
      const now = new Date();

      const createOrUpdate = async (target?: typeof existing[0]) => {
        if (target) {
          return db.submission.update({
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
        return db.submission.create({
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
      const updated = await db.submission.update({
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
  const lbEntry = await db.leaderboardEntry.upsert({
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
  const questionData = await db.question.findUnique({
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
  const allEntries = await db.leaderboardEntry.findMany({
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
  const passedEnough = entry.submission.passedTestCases > 1; // ✅ new condition

  let rank: number | null = null;
  let points = 0;

  if (hasPassedAny) {
    // If they passed enough, they are eligible for 1st/2nd/3rd
    if (passedEnough) {
      rank = index + 1;

      if (rank === 1) points = questionData.winner;
      else if (rank === 2) points = questionData.runnerUp;
      else if (rank === 3) points = questionData.secondRunnerUp;
      else points = questionData.participant;
    } else {
      // Not eligible → push them down the ranking
      rank = index + 4; // start from 4th place
      points = questionData.participant;
    }
  }
  return db.leaderboardEntry.update({
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
  const question = await db.question.findUnique({
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
      });
    }),
});



// import { z } from "zod";
// import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// export const submissionRouter = createTRPCRouter({
//   save: protectedProcedure
//     .input(
//       z.object({
//         teamId: z.string(),
//         questionId: z.string(),
//         worksheet: z.any(),
//         passedTestCases: z.number(),
//         totalTestCases: z.number(),
//         allPassed: z.boolean().optional().default(false),
//         failedTestCase: z
//           .object({
//             input: z.string(),
//             expected: z.string(),
//             output: z.string().nullable(),
//             originalIdx: z.number(),
//           })
//           .nullable(),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       const {
//         teamId,
//         questionId,
//         worksheet,
//         passedTestCases,
//         totalTestCases,
//         allPassed = false,
//         failedTestCase,
//       } = input;

//       const MAX_RETRIES = 3;
//       const advisoryKey = `${teamId}::${questionId}`;

//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           // All DB operations that must be consistent run inside this transaction
//           const updatedSubmission = await ctx.db.$transaction(async (tx) => {
//             // Acquire a transaction-scoped advisory lock (Postgres)
//             // This serializes concurrent requests for the same team+question key.
//             await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${advisoryKey}));`;

//             // Re-fetch existing submissions for this team+question inside the tx
//             const existing = await tx.submission.findMany({
//               where: { teamId, questionId },
//               orderBy: { createdAt: "asc" },
//             });

//             const passedSubs = existing.filter((s) => s.allPassed);
//             const failedSubs = existing.filter((s) => !s.allPassed);
//             const now = new Date();

//             const createOrUpdateWithTx = async (target?: typeof existing[0]) => {
//               if (target) {
//                 return tx.submission.update({
//                   where: { id: target.id },
//                   data: {
//                     worksheet,
//                     passedTestCases,
//                     totalTestCases,
//                     allPassed,
//                     failedTestCases: failedTestCase ? [failedTestCase] : [],
//                     createdAt: now,
//                   },
//                 });
//               }
//               return tx.submission.create({
//                 data: {
//                   teamId,
//                   questionId,
//                   worksheet,
//                   passedTestCases,
//                   totalTestCases,
//                   allPassed,
//                   failedTestCases: failedTestCase ? [failedTestCase] : [],
//                 },
//               });
//             };

//             // Choose which slot to create/update according to your business rules
//             let saved: any;
//             if (allPassed) {
//               if (passedSubs.length < 5) {
//                 saved = await createOrUpdateWithTx();
//               } else {
//                 const sortedPassed = [...passedSubs].sort(
//                   (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
//                 );
//                 const slot = sortedPassed[1]; // keep your existing rule
//                 saved = await createOrUpdateWithTx(slot);
//               }
//             } else {
//               const sorted = failedSubs.sort((a, b) => {
//                 if (b.passedTestCases !== a.passedTestCases)
//                   return b.passedTestCases - a.passedTestCases;
//                 return a.createdAt.getTime() - b.createdAt.getTime();
//               });

//               if (failedSubs.length < 5) {
//                 saved = await createOrUpdateWithTx();
//               } else {
//                 const lastSorted = sorted[sorted.length - 1];
//                 const minPassed = lastSorted ? lastSorted.passedTestCases : 0;
//                 const leastPassed = sorted.filter(
//                   (s) => s.passedTestCases === minPassed
//                 );

//                 let slot: typeof existing[0] | undefined;

//                 if (leastPassed.length >= 2) {
//                   slot = leastPassed[1]; // 2nd oldest among the least passed
//                 } else {
//                   slot = leastPassed[0]; // fallback
//                 }

//                 saved = await createOrUpdateWithTx(slot);
//               }
//             }

//             // Set submissionCode in the same transaction
//             const code = `SUB-${saved.id.toString().padStart(4, "0")}`;
//             const updated = await tx.submission.update({
//               where: { id: saved.id },
//               data: { submissionCode: code },
//             });

//             // Determine whether this submission is better than existing ones
//             const maxExistingPassed = existing.reduce((mx, s) => {
//               return Math.max(mx, s.passedTestCases ?? 0);
//             }, 0);

//             const isBetter = updated.passedTestCases > maxExistingPassed;

//             if (isBetter) {
//               // Upsert leaderboard entry for this team+question
//               await tx.leaderboardEntry.upsert({
//                 where: {
//                   teamId_questionId: { teamId, questionId },
//                 },
//                 update: {
//                   submissionId: updated.id,
//                   updatedAt: new Date(),
//                 },
//                 create: {
//                   teamId,
//                   questionId,
//                   submissionId: updated.id,
//                 },
//               });

//               // Fetch question points config
//               const questionData = await tx.question.findUnique({
//                 where: { id: questionId },
//                 select: {
//                   winner: true,
//                   runnerUp: true,
//                   secondRunnerUp: true,
//                   participant: true,
//                 },
//               });
//               if (!questionData)
//                 throw new Error(`Question not found for ID: ${questionId}`);

//               // Fetch all leaderboard entries for this question and include submission stats
//               const allEntries = await tx.leaderboardEntry.findMany({
//                 where: { questionId },
//                 include: { submission: true },
//               });

//               // Sort by passedTestCases desc, then by submission.createdAt asc
//               allEntries.sort((a, b) => {
//                 const aPassed = a.submission?.passedTestCases ?? 0;
//                 const bPassed = b.submission?.passedTestCases ?? 0;
//                 if (bPassed !== aPassed) return bPassed - aPassed;

//                 const aTime = a.submission?.createdAt
//                   ? a.submission.createdAt.getTime()
//                   : 0;
//                 const bTime = b.submission?.createdAt
//                   ? b.submission.createdAt.getTime()
//                   : 0;
//                 return aTime - bTime;
//               });

//               // Assign ranks & points
//               const updates = allEntries.map((entry, index) => {
//                 const hasPassedAny = (entry.submission?.passedTestCases ?? 0) > 0;
//                 let rank: number | null = null;
//                 let points = 0;

//                 if (hasPassedAny) {
//                   rank = index + 1;
//                   if (rank === 1) points = questionData.winner;
//                   else if (rank === 2) points = questionData.runnerUp;
//                   else if (rank === 3) points = questionData.secondRunnerUp;
//                   else points = questionData.participant;
//                 }

//                 return tx.leaderboardEntry.update({
//                   where: { id: entry.id },
//                   data: {
//                     rank,
//                     points,
//                   },
//                 });
//               });

//               await Promise.all(updates);
//             } else {
//               // not better — no leaderboard changes
//             }

//             return updated;
//           }); // end $transaction

//           // Transaction committed successfully. Emit socket update after commit.
//           try {
//             // Your original code emitted with { questionId: "overall" }
//             // Keep same payload for backward compatibility — adjust if needed.
//             await fetch(`${process.env.SOCKET_URL}/emit-leaderboard-update`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ questionId: "overall" }),
//             });
//           } catch (emitErr: any) {
//             console.warn("Failed to emit leaderboard update:", emitErr?.message ?? emitErr);
//           }

//           // Return the updated submission
//           return updatedSubmission;
//         } catch (err: any) {
//           // Detect transient serialization/lock errors and retry
//           const errMsg = (err && (err.message || "")).toString();
//           const code = (err && err.code) || "";

//           const isTransient =
//             code === "40001" /* serialization_failure */ ||
//             /deadlock/i.test(errMsg) ||
//             /could not obtain lock/i.test(errMsg) ||
//             /could not serialize/i.test(errMsg);

//           if (isTransient && attempt < MAX_RETRIES) {
//             // small exponential backoff then retry
//             await new Promise((r) => setTimeout(r, 50 * attempt));
//             continue;
//           }

//           // Non-retryable or max attempts reached: bubble up
//           throw err;
//         }
//       } // end retries loop

//       // If we exhausted retries without returning, throw a generic error
//       throw new Error("Failed to save submission after multiple attempts due to DB contention.");
//     }),
// });
