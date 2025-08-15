import { PrismaClient } from '@prisma/client';
import { QuestionMeta } from '@/lib/QuestionMeta'; // make sure this file exports the question definitions

const prisma = new PrismaClient();

async function seedTeams() {
  const teamNames = [
    'team1',
    'team2',
    'team3',
    'team4',
    'team5',
    'team6',
    'team7',
    'team8',
    'team9',
    'team10',
  ];

  for (const name of teamNames) {
    await prisma.team.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Seeded teams: team1 → team10');
}

async function resetAndSeedQuestions() {
  await prisma.$transaction(async (tx) => {
    // Step 1: Find questions with code Q001 → Q005
    const questionsToDelete = await tx.question.findMany({
      where: { code: { in: ['Q001', 'Q002', 'Q003', 'Q004', 'Q005'] } },
      select: { id: true },
    });

    // Step 2: Delete related records first (FK safe)
    for (const { id } of questionsToDelete) {
      await tx.question.update({
        where: { id },
        data: { teams: { set: [] } },
      });
      await tx.testCase.deleteMany({ where: { questionId: id } });
      await tx.leaderboardEntry.deleteMany({ where: { questionId: id } });
      await tx.submission.deleteMany({ where: { questionId: id } });
      await tx.question.delete({ where: { id } });
    }

    // Step 3: Reset sequence for `number`
    await tx.$executeRawUnsafe(`
      ALTER SEQUENCE "Question_number_seq" RESTART WITH 1;
    `);

    // Step 4: Re-insert questions from QuestionMeta
    for (const q of QuestionMeta) {
      const now = new Date();
      const startTime = q.startTime
        ? new Date(q.startTime)
        : new Date(now.getTime() + 10 * 60 * 1000);

      const endTime = q.endTime
        ? new Date(q.endTime)
        : new Date(startTime.getTime() + 90 * 60 * 1000);

      const question = await tx.question.create({
        data: {
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          startTime,
          endTime,
          code: 'TEMP', // placeholder, update below
          winner: q.winner,
          runnerUp: q.runnerUp,
          secondRunnerUp: q.secondRunnerUp,
          participant: q.participant,
        },
      });

      // Update with proper Q001, Q002, ...
      const paddedNumber = String(question.number).padStart(3, '0');
      await tx.question.update({
        where: { id: question.id },
        data: { code: `Q${paddedNumber}` },
      });

      // Create test cases
      await tx.testCase.createMany({
        data: q.testCases.map((tc) => ({
          input: tc.input,
          expected: tc.expected,
          isVisible: tc.isVisible,
          questionId: question.id,
        })),
      });
    }
  });

  console.log('✅ Reset and seeded questions from QuestionMeta');
}

async function main() {
  await seedTeams();
  await resetAndSeedQuestions();
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
