import { prisma } from "@/lib/prisma";
import { LINKED_PUBLIC_CLIENT_ID } from "@/lib/storage/user-profile-storage";

const LINKED_CLIENT_EMAIL = "danisan@diyegram.com";

export async function resolveClientUserId(input: {
  clientId: string;
  dietitianId: string;
}) {
  if (
    input.clientId === LINKED_PUBLIC_CLIENT_ID ||
    input.clientId === "client-1"
  ) {
    const linkedClient = await prisma.user.findFirst({
      where: {
        email: LINKED_CLIENT_EMAIL,
        role: "CLIENT",
        assignedDietitianId: input.dietitianId,
      },
      select: { id: true },
    });

    return linkedClient?.id ?? null;
  }

  const client = await prisma.user.findFirst({
    where: {
      id: input.clientId,
      role: "CLIENT",
      assignedDietitianId: input.dietitianId,
    },
    select: { id: true },
  });

  return client?.id ?? null;
}
