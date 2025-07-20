import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { nanoid } from "nanoid"
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
          where: { isVisible: true },
          select: {
            input: true,
            expected: true,
          },
        },
        teams: true,
      },
    });

    if (!question) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Question not found",
      });
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

    // 4. Create submission if not already created
    const existingSubmission = await ctx.db.submission.findFirst({
      where: {
        teamId: team.id,
        questionId: question.id,
      },
    });

    if (!existingSubmission) {
      await ctx.db.submission.create({
        data: {
          teamId: team.id,
          questionId: question.id,
          codeSubmitted: "",
        },
      });
    }
    console.log("Question selected:", question);
    // 5. Return question data in compatible format
    return {
      title: question.title,
      description: question.description,
      testCases: question.testCases,
      difficulty: question.difficulty,
      startTime: question.startTime ? question.startTime.toISOString() : null,
      endTime: question.endTime ? question.endTime.toISOString() : null,
      createdAt: question.createdAt.toISOString(), // string type
      code: question.code,
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
        testCases,
      } = input

      // Step 1: Create the Question with dummy code
      const question = await ctx.db.question.create({
        data: {
          title,
          description,
          difficulty,
          startTime,
          endTime,
          code: "TEMP",
        },
      })

      // Step 2: Generate proper code
      const paddedNumber = String(question.number).padStart(3, "0")
      const finalCode = `Q${paddedNumber}`

      // Step 3: Update the question with the final code
      const updatedQuestion = await ctx.db.question.update({
        where: { id: question.id },
        data: { code: finalCode },
      })

      // Step 4: Create associated test cases
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


  delete: publicProcedure
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
    await ctx.db.testCase.deleteMany({ where: { questionId: input.id } });
    await ctx.db.submission.deleteMany({ where: { questionId: input.id } });
    await ctx.db.leaderboardEntry.deleteMany({ where: { questionId: input.id } });

    // Step 3: Delete the question itself
    await ctx.db.question.delete({
      where: { id: input.id },
    });

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
      number: z.number().optional(),
      testCases: z
        .array(
          z.object({
            id: z.string().optional(), // undefined for new test cases
            input: z.string(),
            expected: z.string(),
            isVisible: z.boolean().optional(),
          })
        )
        .optional(),
    })
  )
.mutation(async ({ ctx, input }) => {
  const { id, testCases = [], ...questionData } = input;
  console.log(input)
  console.log("Updating question:", questionData.startTime, questionData.endTime);
  // 1. Sync TestCases
  const existing = await ctx.db.testCase.findMany({
    where: { questionId: id },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((tc) => tc.id));
  const incomingIds = new Set(
    testCases.map((tc) => tc.id).filter(Boolean) as string[]
  );

  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  // 1.1 Delete test cases that are no longer present
  if (toDelete.length > 0) {
    await ctx.db.testCase.deleteMany({
      where: { id: { in: toDelete } },
    });
  }

  // 1.2 Upsert test cases (create or update)
  await Promise.all(
    testCases.map((tc) =>
      ctx.db.testCase.upsert({
        where: { id: tc.id ?? "fake-id-to-force-create" }, // upsert requires `where`
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

  // 2. Update the question
  const updatedQuestion = await ctx.db.question.update({
    where: { id },
    data: {
      ...questionData,
    },
    include: {
      testCases: true,
    },
  });

  return updatedQuestion;
}),
})
