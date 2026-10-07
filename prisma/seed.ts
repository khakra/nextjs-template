// Seeds sample data for local development. Run with: pnpm db:seed
// Relative imports (not @/ aliases) because this runs under tsx, outside Next.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { FREE_PLAN_CREDITS } from "../src/lib/plans";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      credits: FREE_PLAN_CREDITS,
      usage: 0,
    },
  });

  console.log(`Seeded demo user: ${demoUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
