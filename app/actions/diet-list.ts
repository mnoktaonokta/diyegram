"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { resolveClientUserId } from "@/lib/meal/resolve-client";
import { prisma } from "@/lib/prisma";
import { uploadDietListFilesToStorage } from "@/lib/supabase/diet-list-storage";
import type { DietListUpload } from "@/lib/types/client-diet-list";
import type { DietListStoredFile } from "@/lib/types/client-diet-list-stored";
import { formatDietListLabel } from "@/lib/utils/clinical-dates";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function parseStoredFiles(value: unknown): DietListStoredFile[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("id" in entry) ||
      !("type" in entry) ||
      !("url" in entry) ||
      !("fileName" in entry)
    ) {
      return [];
    }

    const file = entry as DietListStoredFile;

    if (
      (file.type !== "image" && file.type !== "pdf") ||
      typeof file.url !== "string" ||
      typeof file.fileName !== "string"
    ) {
      return [];
    }

    return [file];
  });
}

function mapStoredRecordToUpload(record: {
  id: string;
  label: string;
  createdAt: Date;
  files: unknown;
}): DietListUpload {
  const files = parseStoredFiles(record.files);

  return {
    id: record.id,
    label: record.label,
    uploadedAt: record.createdAt.toISOString(),
    files: files.map((file) => ({
      id: file.id,
      type: file.type,
      dataUrl: file.url,
      fileName: file.fileName,
    })),
  };
}

function getDietListFilesFromFormData(formData: FormData) {
  return formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function uploadClientDietListAction(
  formData: FormData,
): Promise<ActionResult<DietListUpload>> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar yükleyebilir" };
    }

    const files = getDietListFilesFromFormData(formData);

    if (files.length === 0) {
      return { success: false, error: "Dosya seçilmedi" };
    }

    const storedFiles = await uploadDietListFilesToStorage(files, {
      userId: session.user.id,
    });

    const createdAt = new Date();
    const record = await prisma.clientDietList.create({
      data: {
        userId: session.user.id,
        label: formatDietListLabel(createdAt),
        files: storedFiles,
      },
    });

    revalidatePath("/client/diet-list");
    revalidatePath("/dietitian/client", "layout");

    return {
      success: true,
      data: mapStoredRecordToUpload(record),
    };
  } catch (error) {
    console.error("[uploadClientDietListAction]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Diyet listesi kaydedilemedi",
    };
  }
}

export async function getClientLatestDietListForDietitianAction(
  clientId: string,
): Promise<ActionResult<DietListUpload | null>> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler erişebilir" };
    }

    const clientUserId = await resolveClientUserId({
      clientId,
      dietitianId: session.user.id,
    });

    if (!clientUserId) {
      return { success: false, error: "Danışan bulunamadı" };
    }

    const record = await prisma.clientDietList.findFirst({
      where: { userId: clientUserId },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: mapStoredRecordToUpload(record),
    };
  } catch (error) {
    console.error("[getClientLatestDietListForDietitianAction]", error);
    return { success: false, error: "Diyet listesi yüklenemedi" };
  }
}
