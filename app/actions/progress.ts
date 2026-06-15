"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type {
  ProgressDailyActivity,
  ProgressHistoryPoint,
} from "@/lib/mock/client-data";
import { mapUserToClinicalState } from "@/lib/clinical/mappers";
import { dateKeyToDate, dateToDateKey } from "@/lib/meal/date";
import { prisma } from "@/lib/prisma";
import type { ClientClinicalState } from "@/lib/storage/client-clinical-storage";
import type { ProgressPhoto } from "@/lib/types/client-progress";
import {
  buildClientMotivationData,
  type SelectedDietitian,
} from "@/lib/storage/client-clinical-storage";
import {
  getFormDataFiles,
  getFormDataString,
  uploadFilesToStorage,
} from "@/lib/supabase/storage";
import { sanitizeImageUrls } from "@/lib/types/dietitian-social";
import { todayKey } from "@/lib/utils/calendar";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const LINKED_DIETITIAN_EMAIL = "diyetisyen@diyegram.com";

async function requireClientSession() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    throw new Error("Danışan oturumu gerekli");
  }

  return session;
}

function revalidateProgressPaths() {
  revalidatePath("/client");
  revalidatePath("/client/progress");
  revalidatePath("/client/diet-list");
}

async function loadClientUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      assignedDietitian: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

async function resolveDietitianUserId(input: {
  id: string;
  name: string;
}) {
  if (input.id === "dt-1" || input.id === "dt-linked") {
    const linked = await prisma.user.findFirst({
      where: {
        email: LINKED_DIETITIAN_EMAIL,
        role: "DIETITIAN",
      },
      select: { id: true },
    });

    return linked?.id ?? null;
  }

  const byId = await prisma.user.findFirst({
    where: {
      id: input.id,
      role: "DIETITIAN",
    },
    select: { id: true },
  });

  if (byId) {
    return byId.id;
  }

  const nameParts = input.name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const byName = await prisma.user.findFirst({
    where: {
      role: "DIETITIAN",
      firstName: firstName ?? undefined,
      lastName: lastName || undefined,
    },
    select: { id: true },
  });

  return byName?.id ?? null;
}

function mapProgressHistory(
  rows: { date: Date; weight: number; fatPercentage: number }[],
): ProgressHistoryPoint[] {
  return rows
    .map((row) => ({
      date: dateToDateKey(row.date),
      weight: row.weight,
      fatPercentage: row.fatPercentage,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mapProgressActivity(
  rows: {
    date: Date;
    steps: number;
    exerciseMinutes: number;
    waterGlasses: number;
  }[],
): ProgressDailyActivity[] {
  return rows
    .map((row) => ({
      date: dateToDateKey(row.date),
      steps: row.steps,
      exerciseMinutes: row.exerciseMinutes,
      waterGlasses: row.waterGlasses,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mapProgressPhotos(
  rows: {
    id: string;
    imageUrl: string;
    date: Date;
    label: string | null;
  }[],
): ProgressPhoto[] {
  return rows
    .map((row) => ({
      id: row.id,
      imageUrl: row.imageUrl,
      date: dateToDateKey(row.date),
      label: row.label ?? undefined,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function buildFallbackHistory(user: NonNullable<Awaited<ReturnType<typeof loadClientUser>>>) {
  const clinical = mapUserToClinicalState(user);
  const today = todayKey();
  const startDate = clinical.programStartedAt;

  const points: ProgressHistoryPoint[] = [
    {
      date: startDate,
      weight: clinical.start.weight,
      fatPercentage: clinical.start.fatPercentage,
    },
  ];

  if (today !== startDate) {
    points.push({
      date: today,
      weight: clinical.current.weight,
      fatPercentage: clinical.current.fatPercentage,
    });
  }

  return points;
}

export async function getClinicalStateAction(): Promise<
  ActionResult<{
    clinical: ClientClinicalState;
    motivation: ReturnType<typeof buildClientMotivationData>;
  }>
> {
  try {
    const session = await requireClientSession();
    const user = await loadClientUser(session.user.id);

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const clinical = mapUserToClinicalState(user);

    return {
      success: true,
      data: {
        clinical,
        motivation: buildClientMotivationData(clinical),
      },
    };
  } catch (error) {
    console.error("[getClinicalStateAction]", error);
    return { success: false, error: "Klinik veriler yüklenemedi" };
  }
}

export async function getProgressSnapshotAction(): Promise<
  ActionResult<{
    history: ProgressHistoryPoint[];
    activity: ProgressDailyActivity[];
    photos: ProgressPhoto[];
  }>
> {
  try {
    const session = await requireClientSession();
    const user = await loadClientUser(session.user.id);

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const [historyRows, activityRows, photoRows] = await Promise.all([
      prisma.progress.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "asc" },
      }),
      prisma.dailyActivity.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "asc" },
      }),
      prisma.progressPhoto.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
    ]);

    const history =
      historyRows.length > 0
        ? mapProgressHistory(historyRows)
        : buildFallbackHistory(user);

    return {
      success: true,
      data: {
        history,
        activity: mapProgressActivity(activityRows),
        photos: mapProgressPhotos(photoRows),
      },
    };
  } catch (error) {
    console.error("[getProgressSnapshotAction]", error);
    return { success: false, error: "Gelişim verileri yüklenemedi" };
  }
}

export async function updateClinicalMeasurementsAction(input: {
  currentWeight: number;
  currentFatPercentage: number;
  nextAppointmentDate: string;
}): Promise<ActionResult<{ clinical: ClientClinicalState }>> {
  try {
    const session = await requireClientSession();
    const user = await loadClientUser(session.user.id);

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const today = dateKeyToDate(todayKey());

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        previousWeight: user.currentWeight,
        previousFatPercentage: user.currentFatPercentage,
        currentWeight: input.currentWeight,
        currentFatPercentage: input.currentFatPercentage,
        nextAppointmentDate: dateKeyToDate(input.nextAppointmentDate),
      },
    });

    await prisma.progress.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      create: {
        userId: session.user.id,
        date: today,
        weight: input.currentWeight,
        fatPercentage: input.currentFatPercentage,
      },
      update: {
        weight: input.currentWeight,
        fatPercentage: input.currentFatPercentage,
      },
    });

    revalidateProgressPaths();

    const updatedUser = await loadClientUser(session.user.id);
    const clinical = mapUserToClinicalState(updatedUser!);

    return { success: true, data: { clinical } };
  } catch (error) {
    console.error("[updateClinicalMeasurementsAction]", error);
    return { success: false, error: "Ölçümler kaydedilemedi" };
  }
}

export async function startNewDietProgramAction(input: {
  dietitian: SelectedDietitian;
  startWeight: number;
  startFatPercentage: number;
  targetWeight: number;
  targetFatPercentage: number;
}): Promise<ActionResult<{ clinical: ClientClinicalState }>> {
  try {
    const session = await requireClientSession();
    const dietitianId = await resolveDietitianUserId(input.dietitian);

    if (!dietitianId) {
      return { success: false, error: "Diyetisyen bulunamadı" };
    }

    const programStartedAt = dateKeyToDate(todayKey());

    await prisma.$transaction([
      prisma.progressPhoto.deleteMany({ where: { userId: session.user.id } }),
      prisma.dailyExercise.deleteMany({ where: { userId: session.user.id } }),
      prisma.dailyActivity.deleteMany({ where: { userId: session.user.id } }),
      prisma.progress.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          assignedDietitianId: dietitianId,
          programStartedAt,
          startWeight: input.startWeight,
          startFatPercentage: input.startFatPercentage,
          previousWeight: input.startWeight,
          previousFatPercentage: input.startFatPercentage,
          currentWeight: input.startWeight,
          currentFatPercentage: input.startFatPercentage,
          targetWeight: input.targetWeight,
          targetFatPercentage: input.targetFatPercentage,
        },
      }),
      prisma.progress.create({
        data: {
          userId: session.user.id,
          date: programStartedAt,
          weight: input.startWeight,
          fatPercentage: input.startFatPercentage,
        },
      }),
      prisma.dailyActivity.create({
        data: {
          userId: session.user.id,
          date: programStartedAt,
          steps: 0,
          exerciseMinutes: 0,
          waterGlasses: 0,
        },
      }),
    ]);

    revalidateProgressPaths();

    const updatedUser = await loadClientUser(session.user.id);
    const clinical = mapUserToClinicalState(updatedUser!);

    return { success: true, data: { clinical } };
  } catch (error) {
    console.error("[startNewDietProgramAction]", error);
    return { success: false, error: "Yeni program başlatılamadı" };
  }
}

export async function addProgressPhotoAction(
  formData: FormData,
): Promise<ActionResult<ProgressPhoto>> {
  try {
    const session = await requireClientSession();
    const dateKey = getFormDataString(formData, "dateKey") || todayKey();
    const date = dateKeyToDate(dateKey);
    const files = getFormDataFiles(formData, "image");

    if (files.length === 0) {
      return { success: false, error: "Geçerli bir fotoğraf gerekli" };
    }

    const uploadedUrls = sanitizeImageUrls(
      await uploadFilesToStorage(files, {
        userId: session.user.id,
        folder: "progress",
      }),
    );

    if (uploadedUrls.length === 0) {
      return { success: false, error: "Geçerli bir fotoğraf gerekli" };
    }

    const imageUrl = uploadedUrls[0]!;

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: session.user.id,
        imageUrl,
        date,
      },
    });

    revalidateProgressPaths();

    return {
      success: true,
      data: {
        id: photo.id,
        imageUrl: photo.imageUrl,
        date: dateToDateKey(photo.date),
      },
    };
  } catch (error) {
    console.error("[addProgressPhotoAction]", error);
    return { success: false, error: "Fotoğraf kaydedilemedi" };
  }
}

export async function getProgressPhotosAction(): Promise<
  ActionResult<ProgressPhoto[]>
> {
  try {
    const session = await requireClientSession();

    const rows = await prisma.progressPhoto.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      data: mapProgressPhotos(rows),
    };
  } catch (error) {
    console.error("[getProgressPhotosAction]", error);
    return { success: false, error: "Fotoğraflar yüklenemedi" };
  }
}
