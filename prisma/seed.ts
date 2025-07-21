import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
