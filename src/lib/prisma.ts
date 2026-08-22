import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Fail here rather than at the first query. Unset, `pg` falls back to libpq
// defaults and connects to localhost as the current OS user, so the error you
// get is "database <your-username> does not exist" — which sends people hunting
// for a migration bug in a database they never configured.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.sample to .env.development and set it."
  );
}

// Each server instance gets its own pool, so on a platform that runs many
// concurrent instances the defaults (10 connections, no acquire timeout) will
// exhaust a standard 100-connection Postgres and then wait forever instead of
// failing. Point DATABASE_URL at a pooler in production and keep this small.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10_000,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Set `export DEBUG="*"` to enable debug logging for Prisma Client
/*
globalForPrisma.prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "stdout",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});
*/

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
