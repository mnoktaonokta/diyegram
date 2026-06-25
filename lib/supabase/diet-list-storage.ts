import "server-only";

import { createSupabaseStorageClient } from "@/lib/supabase/client";
import type { DietListStoredFile } from "@/lib/types/client-diet-list-stored";
import { uploadFileToStorage } from "@/lib/supabase/storage";

const UPLOADS_BUCKET = "uploads";

function createStoredFileId() {
  return `dlf-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function buildDietListStoragePath(userId: string, file: File) {
  const extension = isPdfFile(file)
    ? "pdf"
    : file.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 48);

  return `${userId}/diet-lists/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName || "file"}.${extension}`;
}

function resolveDietListContentType(file: File) {
  if (isPdfFile(file)) {
    return "application/pdf";
  }

  if (file.type.startsWith("image/")) {
    return file.type;
  }

  return "image/jpeg";
}

export async function uploadDietListFilesToStorage(
  files: File[],
  options: { userId: string },
): Promise<DietListStoredFile[]> {
  const uploads = files.map(async (file) => {
    if (!isPdfFile(file) && !isImageFile(file)) {
      throw new Error("Yalnızca görsel veya PDF yükleyebilirsiniz.");
    }

    const path = buildDietListStoragePath(options.userId, file);
    const url = await uploadFileToStorage(file, {
      path,
      contentType: resolveDietListContentType(file),
      sourceFile: file,
    });

    return {
      id: createStoredFileId(),
      type: isPdfFile(file) ? "pdf" : "image",
      url,
      fileName: file.name,
    } satisfies DietListStoredFile;
  });

  return Promise.all(uploads);
}

export async function deleteDietListStorageFolder(userId: string) {
  const supabase = createSupabaseStorageClient();
  const prefix = `${userId}/diet-lists`;
  const { data: files, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .list(prefix, { limit: 1000 });

  if (error) {
    console.error("[deleteDietListStorageFolder] list failed", error);
    return;
  }

  const pathsToDelete = (files ?? [])
    .filter((file) => file.id)
    .map((file) => `${prefix}/${file.name}`);

  if (pathsToDelete.length === 0) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .remove(pathsToDelete);

  if (removeError) {
    console.error("[deleteDietListStorageFolder] remove failed", removeError);
    throw removeError;
  }
}
