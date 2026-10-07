import prisma from "@/lib/prisma";

// Spending side of the credit system. Granting lives in src/lib/auth.ts:
// `credits` is the allowance for the current billing period and `usage` is
// what has been spent in it, so remaining = credits - usage.

export class InsufficientCreditsError extends Error {
  readonly remaining: number;

  constructor(remaining: number) {
    super("Not enough credits");
    this.name = "InsufficientCreditsError";
    this.remaining = remaining;
  }
}

export interface CreditBalance {
  credits: number;
  remaining: number;
  usage: number;
}

function assertAmount(amount: number) {
  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error(`Credit amount must be a positive integer, got ${amount}`);
  }
}

function toBalance(row: { credits: number; usage: number }): CreditBalance {
  return {
    credits: row.credits,
    usage: row.usage,
    remaining: Math.max(0, row.credits - row.usage),
  };
}

export async function getCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, usage: true },
  });
  return user ? toBalance(user) : null;
}

/**
 * Spends credits atomically, or throws InsufficientCreditsError. The balance
 * check and the increment are a single conditional UPDATE, so concurrent
 * requests can't both spend the last credit.
 */
export async function consumeCredits(userId: string, amount = 1) {
  assertAmount(amount);
  const rows = await prisma.$queryRaw<{ credits: number; usage: number }[]>`
    UPDATE "user"
    SET "usage" = "usage" + ${amount}, "updatedAt" = NOW()
    WHERE "id" = ${userId} AND "usage" + ${amount} <= "credits"
    RETURNING "credits", "usage"
  `;
  const [row] = rows;
  if (!row) {
    const balance = await getCredits(userId);
    throw new InsufficientCreditsError(balance?.remaining ?? 0);
  }
  return toBalance(row);
}

/**
 * Gives back credits from a failed operation. Floors usage at zero, since a
 * renewal may have reset it between the spend and the refund.
 */
export async function refundCredits(userId: string, amount = 1) {
  assertAmount(amount);
  const rows = await prisma.$queryRaw<{ credits: number; usage: number }[]>`
    UPDATE "user"
    SET "usage" = GREATEST("usage" - ${amount}, 0), "updatedAt" = NOW()
    WHERE "id" = ${userId}
    RETURNING "credits", "usage"
  `;
  return rows[0] ? toBalance(rows[0]) : null;
}

/**
 * Spends credits up front and refunds them if `fn` throws, so users aren't
 * charged for work that failed:
 *
 *   const image = await withCredits(session.user.id, 2, () => generateImage(prompt));
 */
export async function withCredits<T>(
  userId: string,
  amount: number,
  fn: () => Promise<T>
) {
  await consumeCredits(userId, amount);
  try {
    return await fn();
  } catch (error) {
    await refundCredits(userId, amount);
    throw error;
  }
}
