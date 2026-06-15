"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type { DailyExerciseEntry } from "@/lib/mock/client-data";
import { sumExerciseMinutes } from "@/lib/activity/exercise-minutes";
import { dateKeyToDate, dateToDateKey } from "@/lib/meal/date";
import { prisma } from "@/lib/prisma";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DailyActivitySnapshot = {
  dateKey: string;
  waterGlasses: number;
  steps: number;
  exerciseMinutes: number;
  exercises: DailyExerciseEntry[];
};

async function requireClientSession() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    throw new Error("Danışan oturumu gerekli");
  }

  return session;
}

function revalidateActivityPaths() {
  revalidatePath("/client");
  revalidatePath("/client/progress");
  revalidatePath("/client/diet-list");
}

async function syncDailyActivityMetrics(userId: string, date: Date) {
  const exercises = await prisma.dailyExercise.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
  });

  const exerciseMinutes = sumExerciseMinutes(exercises);
  const existing = await prisma.dailyActivity.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });

  await prisma.dailyActivity.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    create: {
      userId,
      date,
      waterGlasses: existing?.waterGlasses ?? 0,
      steps: existing?.steps ?? 0,
      exerciseMinutes,
    },
    update: {
      exerciseMinutes,
    },
  });

  return exerciseMinutes;
}

function mapExercise(row: {
  id: string;
  categoryId: string | null;
  categoryLabel: string;
  emoji: string;
  detail: string;
}): DailyExerciseEntry {
  return {
    id: row.id,
    categoryId: row.categoryId as DailyExerciseEntry["categoryId"],
    categoryLabel: row.categoryLabel,
    emoji: row.emoji,
    detail: row.detail,
  };
}

export async function getDailyActivityForDateAction(
  dateKey: string,
): Promise<ActionResult<DailyActivitySnapshot>> {
  try {
    const session = await requireClientSession();
    const date = dateKeyToDate(dateKey);

    const [activity, exercises] = await Promise.all([
      prisma.dailyActivity.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date,
          },
        },
      }),
      prisma.dailyExercise.findMany({
        where: {
          userId: session.user.id,
          date,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const mappedExercises = exercises.map(mapExercise);
    const exerciseMinutes =
      activity?.exerciseMinutes ?? sumExerciseMinutes(mappedExercises);

    return {
      success: true,
      data: {
        dateKey,
        waterGlasses: activity?.waterGlasses ?? 0,
        steps: activity?.steps ?? 0,
        exerciseMinutes,
        exercises: mappedExercises,
      },
    };
  } catch (error) {
    console.error("[getDailyActivityForDateAction]", error);
    return { success: false, error: "Günlük aktivite yüklenemedi" };
  }
}

export async function getActivityDatesAction(): Promise<ActionResult<string[]>> {
  try {
    const session = await requireClientSession();

    const [activityRows, exerciseRows] = await Promise.all([
      prisma.dailyActivity.findMany({
        where: {
          userId: session.user.id,
          OR: [{ waterGlasses: { gt: 0 } }, { exerciseMinutes: { gt: 0 } }],
        },
        select: { date: true },
      }),
      prisma.dailyExercise.findMany({
        where: { userId: session.user.id },
        select: { date: true },
        distinct: ["date"],
      }),
    ]);

    const dates = new Set<string>();
    for (const row of activityRows) {
      dates.add(dateToDateKey(row.date));
    }
    for (const row of exerciseRows) {
      dates.add(dateToDateKey(row.date));
    }

    return {
      success: true,
      data: [...dates],
    };
  } catch (error) {
    console.error("[getActivityDatesAction]", error);
    return { success: false, error: "Aktivite tarihleri yüklenemedi" };
  }
}

export async function incrementWaterGlassAction(
  dateKey: string,
): Promise<ActionResult<{ waterGlasses: number }>> {
  try {
    const session = await requireClientSession();
    const date = dateKeyToDate(dateKey);

    const existing = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
    });

    const waterGlasses = (existing?.waterGlasses ?? 0) + 1;

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      create: {
        userId: session.user.id,
        date,
        waterGlasses,
        steps: 0,
        exerciseMinutes: existing?.exerciseMinutes ?? 0,
      },
      update: {
        waterGlasses,
      },
    });

    revalidateActivityPaths();

    return { success: true, data: { waterGlasses } };
  } catch (error) {
    console.error("[incrementWaterGlassAction]", error);
    return { success: false, error: "Su kaydı güncellenemedi" };
  }
}

export async function decrementWaterGlassAction(
  dateKey: string,
): Promise<ActionResult<{ waterGlasses: number }>> {
  try {
    const session = await requireClientSession();
    const date = dateKeyToDate(dateKey);

    const existing = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
    });

    const waterGlasses = Math.max(0, (existing?.waterGlasses ?? 0) - 1);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      create: {
        userId: session.user.id,
        date,
        waterGlasses: 0,
        steps: 0,
        exerciseMinutes: 0,
      },
      update: {
        waterGlasses,
      },
    });

    revalidateActivityPaths();

    return { success: true, data: { waterGlasses } };
  } catch (error) {
    console.error("[decrementWaterGlassAction]", error);
    return { success: false, error: "Su kaydı güncellenemedi" };
  }
}

export async function addDailyExerciseAction(input: {
  dateKey: string;
  categoryId?: string;
  categoryLabel: string;
  emoji: string;
  detail: string;
}): Promise<ActionResult<DailyExerciseEntry>> {
  try {
    const session = await requireClientSession();
    const date = dateKeyToDate(input.dateKey);

    const created = await prisma.dailyExercise.create({
      data: {
        userId: session.user.id,
        date,
        categoryId: input.categoryId ?? null,
        categoryLabel: input.categoryLabel,
        emoji: input.emoji,
        detail: input.detail,
      },
    });

    await syncDailyActivityMetrics(session.user.id, date);
    revalidateActivityPaths();

    return {
      success: true,
      data: mapExercise(created),
    };
  } catch (error) {
    console.error("[addDailyExerciseAction]", error);
    return { success: false, error: "Egzersiz kaydedilemedi" };
  }
}

export async function removeDailyExerciseAction(
  exerciseId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireClientSession();

    const existing = await prisma.dailyExercise.findUnique({
      where: { id: exerciseId },
      select: { userId: true, date: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Egzersiz bulunamadı" };
    }

    await prisma.dailyExercise.delete({ where: { id: exerciseId } });
    await syncDailyActivityMetrics(session.user.id, existing.date);
    revalidateActivityPaths();

    return { success: true, data: { id: exerciseId } };
  } catch (error) {
    console.error("[removeDailyExerciseAction]", error);
    return { success: false, error: "Egzersiz silinemedi" };
  }
}
