import prisma from "@/prisma/index";

export async function updateUsage({
  userId,
  usage,
}: {
  userId: string;
  usage: number;
}) {
  const usageUpdate = await prisma.user.update({
    where: { id: userId },
    data: {
      usage: { increment: usage },
    },
  });

  return usageUpdate;
}
