import type { ClientClinicalState } from "@/lib/storage/client-clinical-storage";
import { dateToDateKey } from "@/lib/meal/date";
import type { User } from "@/lib/generated/prisma/client";

type UserWithDietitian = User & {
  assignedDietitian: Pick<User, "id" | "firstName" | "lastName"> | null;
};

export function mapUserToClinicalState(user: UserWithDietitian): ClientClinicalState {
  const dietitianName = user.assignedDietitian
    ? [user.assignedDietitian.firstName, user.assignedDietitian.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";

  return {
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
    nextAppointmentDate: user.nextAppointmentDate
      ? dateToDateKey(user.nextAppointmentDate)
      : null,
    selectedDietitian: user.assignedDietitian
      ? {
          id: user.assignedDietitian.id,
          name: dietitianName || "Diyetisyen",
        }
      : null,
    programStartedAt: user.programStartedAt
      ? dateToDateKey(user.programStartedAt)
      : dateToDateKey(user.createdAt),
  };
}
