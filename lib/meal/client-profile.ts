import type { ClientProfile } from "@/lib/mock/dietitian-data";
import { resolveClientUserId } from "@/lib/meal/resolve-client";
import { prisma } from "@/lib/prisma";
import { dateToDateKey } from "@/lib/meal/date";
import {
  mapGenderFromDb,
  resolveProfileAvatarUrl,
} from "@/lib/profile/mappers";
import { formatTurkishLongDate } from "@/lib/utils/clinical-dates";
import { formatFeedTimeAgo } from "@/lib/meal/time-ago";
import { toImageSrc } from "@/lib/utils/image-src";

export async function getClientProfileForDietitian(input: {
  clientId: string;
  dietitianId: string;
}): Promise<ClientProfile | null> {
  const userId = await resolveClientUserId({
    clientId: input.clientId,
    dietitianId: input.dietitianId,
  });

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      age: true,
      height: true,
      avatarUrl: true,
      gender: true,
      programStartedAt: true,
      createdAt: true,
      startWeight: true,
      startFatPercentage: true,
      previousWeight: true,
      previousFatPercentage: true,
      currentWeight: true,
      currentFatPercentage: true,
      targetWeight: true,
      targetFatPercentage: true,
      nextAppointmentDate: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const personalInfoParts: string[] = [];

  if (user.age) {
    personalInfoParts.push(`${user.age} yaş`);
  }

  if (user.height) {
    personalInfoParts.push(`${user.height} cm`);
  }

  return {
    id: input.clientId,
    name: name || "Danışan",
    avatarUrl: toImageSrc(
      resolveProfileAvatarUrl(
        {
          avatarUrl: user.avatarUrl ?? "",
          gender: mapGenderFromDb(user.gender),
        },
        "CLIENT",
      ),
    ),
    personalInfoLabel:
      personalInfoParts.length > 0 ? personalInfoParts.join(" · ") : null,
    measurements: {
      start: {
        weight: user.startWeight ?? 0,
        fatPercentage: user.startFatPercentage ?? 0,
      },
      previous: {
        weight: user.previousWeight ?? user.startWeight ?? 0,
        fatPercentage:
          user.previousFatPercentage ?? user.startFatPercentage ?? 0,
      },
      current: {
        weight: user.currentWeight ?? 0,
        fatPercentage: user.currentFatPercentage ?? 0,
      },
      targetWeight: user.targetWeight ?? 0,
      targetFatPercentage: user.targetFatPercentage ?? 0,
    },
    nextAppointmentDate: user.nextAppointmentDate
      ? formatTurkishLongDate(dateToDateKey(user.nextAppointmentDate))
      : "—",
    joinedAt: user.programStartedAt
      ? formatFeedTimeAgo(user.programStartedAt)
      : formatFeedTimeAgo(user.createdAt),
    registeredAt: user.programStartedAt
      ? dateToDateKey(user.programStartedAt)
      : dateToDateKey(user.createdAt),
    lastActivity: formatFeedTimeAgo(user.updatedAt),
  };
}
