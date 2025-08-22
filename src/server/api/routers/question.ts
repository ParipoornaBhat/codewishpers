import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { QuestionMeta,QuestionCode } from "@/lib/QuestionMeta";

import { nanoid } from "nanoid"
import { start } from "repl";
export const questionRouter = createTRPCRouter({
 questionselect: protectedProcedure
  .input(
    z.object({
      code: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { code } = input;
    // 1. Get the question with visible test cases and team access
    const question = await ctx.db.question.findUnique({
      where: { code },
      include: {
        testCases: {
          select: {
            input: true,
            expected: true,
            isVisible: true, // include this to preserve visibility info
          },
        },
        teams: true,
      },
    });

    if (!question) {
     return {success: false, message: "Question not found"}
    }

    const sessionUserId = ctx.session.user.id;
    const teamName = ctx.session.user.teamName;

    // 2. Get current team
    const team = await ctx.db.team.findFirst({
      where: { name: teamName ?? undefined },
    });

    if (!team) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Team not found for current user",
      });
    }

    // 3. If not associated, connect the team to the question
    const alreadyConnected = question.teams.some((t) => t.id === team.id);
    if (!alreadyConnected) {
      await ctx.db.question.update({
        where: { id: question.id },
        data: {
          teams: {
            connect: { id: team.id },
          },
        },
      });
    }

    // 4. Just fetch existing submission, DO NOT create
    const existingSubmission = await ctx.db.submission.findMany({
      where: {
        teamId: team.id,
        questionId: question.id,
      },
      select: {
        id: true,
        passedTestCases: true,
        totalTestCases: true,
        createdAt: true,
        allPassed: true,
        failedTestCases: true,        
        submissionCode: true,
        worksheet: true, // include worksheet data
      },
    });

    // 5. Return question data in compatible format
    return {
      id: question.id,
      title: question.title,
      description: question.description,
      testCases: question.testCases,
      difficulty: question.difficulty,
      startTime: question.startTime ? question.startTime.toISOString() : null,
      endTime: question.endTime ? question.endTime.toISOString() : null,
      createdAt: question.createdAt.toISOString(),
      code: question.code,
      submissions: existingSubmission ?? null,
    };
  }),



  getAll: publicProcedure.query(async ({ ctx }) => {
  const questions = await ctx.db.question.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      testCases: true,      // fetch all test cases
      submissions: true,    // fetch all submissions
    },
  });

  return questions.map((q) => ({
    id: q.id,
    code: q.code,
    number: q.number,
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    startTime: q.startTime,
    endTime: q.endTime,
    createdAt: q.createdAt,

    // Include all test cases (as array of full test case objects)
    testCases: q.testCases,

    // Derived metadata
    totalTestCases: q.testCases.length,
    visibleTestCases: q.testCases.filter((t) => t.isVisible).length,
    submissions: q.submissions.length,
    passRate:
      q.submissions.length === 0
        ? 0
        : Math.round(
            (q.submissions.filter((s) => s.allPassed).length / q.submissions.length) * 100
          ),
  }));
}),


  // CREATE NEW QUESTION
   create: protectedProcedure
  .input(
    z.object({
      title: z.string().min(3),
      description: z.string().min(3),
      difficulty: z.string().min(1),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      winner: z.number().min(0).default(0),           // new
      runnerUp: z.number().min(0).default(0),         // new
      secondRunnerUp: z.number().min(0).default(0),   // new
      participant: z.number().min(0).default(0),      // new
      testCases: z
        .array(
          z.object({
            input: z.string().min(1),
            expected: z.string().min(1),
            isVisible: z.boolean(),
          })
        )
        .min(1, "At least one test case is required"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const {
      title,
      description,
      difficulty,
      startTime,
      endTime,
      winner,
      runnerUp,
      secondRunnerUp,
      participant,
      testCases,
    } = input

    // Step 1: Prepare the data object
    const data: any = {
      title,
      description,
      difficulty,
      code: "TEMP",
      winner,
      runnerUp, 
      secondRunnerUp,
      participant,
    }

    if (startTime) data.startTime = startTime
    if (endTime) data.endTime = endTime

    // Step 2: Create the Question with dummy code
    const question = await ctx.db.question.create({ data })

    // Step 3: Generate proper code using `question.number`
    const paddedNumber = String(question.number).padStart(3, "0")
    const finalCode = `Q${paddedNumber}`

    // Step 4: Update the question with the final code
    const updatedQuestion = await ctx.db.question.update({
      where: { id: question.id },
      data: { code: finalCode },
    })

    // Step 5: Create associated test cases
    await ctx.db.testCase.createMany({
      data: testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
        isVisible: tc.isVisible,
        questionId: question.id,
      })),
    })

    return { ...updatedQuestion }
  }),

    // UPDATE
update: publicProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      difficulty: z.string().optional(),
      startTime: z.date().nullable().optional(),
      endTime: z.date().nullable().optional(),
      code: z.string().optional(),
      winner: z.number().min(0).optional(),
      runnerUp: z.number().min(0).optional(),
      secondRunnerUp: z.number().min(0).optional(),
      participant: z.number().min(0).optional(),
      number: z.number().optional(),
      testCases: z
        .array(
          z.object({
            id: z.string().optional(),
            input: z.string(),
            expected: z.string(),
            isVisible: z.boolean().optional(),
          })
        )
        .optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, testCases = [], number, ...rest } = input;

    // --- Filter out nulls to avoid Prisma type errors ---
    const questionData: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== null && value !== undefined) {
        questionData[key] = value;
      }
    }

    // --- Sync Test Cases ---
    const existing = await ctx.db.testCase.findMany({
      where: { questionId: id },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((tc) => tc.id));
    const incomingIds = new Set(
      testCases.map((tc) => tc.id).filter(Boolean) as string[]
    );

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    if (toDelete.length > 0) {
      await ctx.db.testCase.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    await Promise.all(
      testCases.map((tc) =>
        ctx.db.testCase.upsert({
          where: { id: tc.id ?? "__INVALID_ID__" }, // force create
          update: {
            input: tc.input,
            expected: tc.expected,
            isVisible: tc.isVisible ?? false,
          },
          create: {
            input: tc.input,
            expected: tc.expected,
            isVisible: tc.isVisible ?? false,
            questionId: id,
          },
        })
      )
    );

    // Fetch old points before update
    const oldQuestion = await ctx.db.question.findUnique({
      where: { id },
      select: {
        winner: true,
        runnerUp: true,
        secondRunnerUp: true,
        participant: true,
      },
    });

    const updatedQuestion = await ctx.db.question.update({
      where: { id },
      data: questionData,
      include: {
        testCases: true,
      },
    });

    // --- If points config changed, update leaderboard entries ---
    const pointsChanged =
      (rest.winner !== undefined && rest.winner !== oldQuestion?.winner) ||
      (rest.runnerUp !== undefined && rest.runnerUp !== oldQuestion?.runnerUp) ||
      (rest.secondRunnerUp !== undefined &&
        rest.secondRunnerUp !== oldQuestion?.secondRunnerUp) ||
      (rest.participant !== undefined &&
        rest.participant !== oldQuestion?.participant);

    if (pointsChanged) {
  const leaderboardEntries = await ctx.db.leaderboardEntry.findMany({
    where: { questionId: id },
    include: {
      submission: {
        select: { passedTestCases: true },
      },
    },
    orderBy: { rank: "asc" },
  });

  await Promise.all(
    leaderboardEntries.map((entry) => {
      const hasPassedAny = entry.submission?.passedTestCases > 0;

      let points = 0; // default no points if failed all
      if (hasPassedAny) {
        if (entry.rank === 1) points = updatedQuestion.winner;
        else if (entry.rank === 2) points = updatedQuestion.runnerUp;
        else if (entry.rank === 3) points = updatedQuestion.secondRunnerUp;
        else points = updatedQuestion.participant;
      }

      return ctx.db.leaderboardEntry.update({
        where: { id: entry.id },
        data: { points },
      });
    })
  );
  

  console.log(`📣 Emitting leaderboard update for question Points Updation: ${updatedQuestion.code}`);
  try {
    const res = await fetch(`${process.env.SOCKET_URL}/emit-leaderboard-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: `overall` }),
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

}


    return updatedQuestion;
  }),

  delete: publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;

    // Step 0: Check if question exists
    const question = await ctx.db.question.findUnique({
      where: { id },
      select: { id: true, teams: true },
    });
    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Step 1: Disconnect all teams (only if any exist)
    if (question.teams.length > 0) {
      await ctx.db.question.update({
        where: { id },
        data: { teams: { set: [] } },
      });
    }

    // Step 2: Clean up dependent models
    const [testCaseCount, submissionCount, leaderboardCount] = await Promise.all([
      ctx.db.testCase.count({ where: { questionId: id } }),
      ctx.db.submission.count({ where: { questionId: id } }),
      ctx.db.leaderboardEntry.count({ where: { questionId: id } }),
    ]);

    if (testCaseCount > 0) {
      await ctx.db.testCase.deleteMany({ where: { questionId: id } });
    }
    if (submissionCount > 0) {
      await ctx.db.submission.deleteMany({ where: { questionId: id } });
    }
    if (leaderboardCount > 0) {
      await ctx.db.leaderboardEntry.deleteMany({ where: { questionId: id } });
    }

    // Step 3: Delete the question itself
    await ctx.db.question.delete({ where: { id } });

    return { success: true };
  }),


  reset: publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Step 1: Disconnect all teams from this question
    await ctx.db.question.update({
      where: { id: input.id },
      data: {
        teams: {
          set: [], // Remove all connections in the many-to-many join table
        },
      },
    });

    // Step 2: Clean up dependent models
    await ctx.db.leaderboardEntry.deleteMany({ where: { questionId: input.id } });
    await ctx.db.submission.deleteMany({ where: { questionId: input.id } });


    console.log(`🔄Socket emits Reset `);
  try {
    const res = await fetch(`${process.env.SOCKET_URL}/emit-leaderboard-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: `overall` }),
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

    return { success: true };
  }),

   getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
        include: {
          testCases: true,
          submissions: true,
          leaderboard: true,
          teams: true,
        },
      });

      if (!question) throw new Error("Question not found");
      return question;
    }),
resetDB: publicProcedure.mutation(async ({ ctx }) => {
  await ctx.db.$transaction(async (tx) => {
    // Step 1: Find questions with code Q001 → Q005
    const questionsToDelete = await tx.question.findMany({
      where: { code: { in: QuestionCode } },
      select: { id: true },
    });
    const questionIds = questionsToDelete.map(q => q.id);

    if (questionIds.length > 0) {
      // Step 2: Delete related records in batches to avoid FK issues
      await tx.leaderboardEntry.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.submission.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.testCase.deleteMany({ where: { questionId: { in: questionIds } } });
      for (const qId of questionIds) {
        await tx.question.update({ where: { id: qId }, data: { teams: { set: [] } } });
      }
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
    }

    // Step 3: Hard reset the sequence for `number` to 1
    await tx.$executeRawUnsafe(`
      ALTER SEQUENCE "Question_number_seq" RESTART WITH 1;
    `);

    // Step 4: Re-insert questions from QuestionMeta
    for (const [index, q] of QuestionMeta.entries()) {
      if (index >= QuestionCode.length) break;
      const now = new Date();
      const startTime = q.startTime
        ? new Date(q.startTime)
        : new Date(now.getTime() + 10 * 60 * 1000);

      const endTime = q.endTime
        ? new Date(q.endTime)
        : new Date(startTime.getTime() + 90 * 60 * 1000);

      // Compute code directly during creation (avoid create → update)
      const paddedNumber = String(index + 1).padStart(3, "0");
      const code = `Q${paddedNumber}`;

      await tx.question.create({
        data: {
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          startTime,
          endTime,
          code,
          winner: q.winner,
          runnerUp: q.runnerUp,
          secondRunnerUp: q.secondRunnerUp,
          participant: q.participant,
          testCases: {
            create: q.testCases.map(tc => ({
              input: tc.input,
              expected: tc.expected,
              isVisible: tc.isVisible,
            })),
          },
        },
      });
    }
  });

  // Emit leaderboard update outside transaction
  console.log(`🔄Socket emits Reset Overall DB`);
  try {
    const res = await fetch(`${process.env.SOCKET_URL}/emit-leaderboard-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: `overall` }),
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

  return { success: true };
}),



    


})
