import "server-only";

import { createSupabaseStorageClient } from "@/lib/supabase/client";

const UPLOADS_BUCKET = "uploads";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "avif",
]);

function resolveFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && IMAGE_EXTENSIONS.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
    case "image/heif":
      return "heic";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

function resolveContentType(file: File): string {
  const type = file.type?.trim().toLowerCase();

  if (type && type.startsWith("image/") && type !== "image/heic" && type !== "image/heif") {
    return type;
  }

  switch (resolveFileExtension(file)) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
  }

  return "image/jpeg";
}

function buildStoragePath(
  userId: string,
  folder: string,
  file: File,
): string {
  const extension = resolveFileExtension(file);
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 48);

  return `${userId}/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName || "image"}.${extension}`;
}

function isLikelyImageFile(file: File) {
  if (file.type.startsWith("image/")) {
    return true;
  }

  if (file.type === "application/octet-stream") {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
}

export function getFormDataFiles(
  formData: FormData,
  fieldName = "images",
): File[] {
  return formData
    .getAll(fieldName)
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0 && isLikelyImageFile(entry),
    );
}

export function getFormDataString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

export function formatStorageError(error: unknown): string {
  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  if (message.includes("mime") || message.includes("content type")) {
    return "Bu dosya formatı desteklenmiyor. JPG veya PNG deneyin.";
  }

  if (message.includes("row-level security") || message.includes("policy")) {
    return "Depolama izni eksik. SUPABASE_SERVICE_ROLE_KEY ekleyin veya storage politikalarını kontrol edin.";
  }

  if (message.includes("bucket") && message.includes("not found")) {
    return "Supabase'de 'uploads' bucket'ı bulunamadı.";
  }

  if (message.includes("payload too large") || message.includes("exceeded")) {
    return "Dosya çok büyük. Daha küçük bir fotoğraf deneyin.";
  }

  return "Fotoğraflar yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.";
}

export async function uploadFileToStorage(
  file: File | Buffer,
  options: {
    path: string;
    contentType?: string;
    sourceFile?: File;
  },
): Promise<string> {
  const supabase = createSupabaseStorageClient();
  const sourceFile = options.sourceFile ?? (file instanceof File ? file : null);
  const contentType =
    sourceFile != null
      ? resolveContentType(sourceFile)
      : options.contentType?.trim() || "image/jpeg";

  const body =
    file instanceof File ? new Uint8Array(await file.arrayBuffer()) : file;

  const { data, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .upload(options.path, body, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(UPLOADS_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function uploadFilesToStorage(
  files: File[],
  options: {
    userId: string;
    folder: string;
  },
): Promise<string[]> {
  const uploads = files.map(async (file) => {
    const path = buildStoragePath(options.userId, options.folder, file);
    return uploadFileToStorage(file, { path, sourceFile: file });
  });

  return Promise.all(uploads);
}

const USER_STORAGE_FOLDERS = ["meals", "progress", "dietitian-posts"] as const;

export async function deleteUserStorageFolder(userId: string) {
  const supabase = createSupabaseStorageClient();
  const pathsToDelete: string[] = [];

  for (const folder of USER_STORAGE_FOLDERS) {
    const prefix = `${userId}/${folder}`;
    const { data: files, error } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .list(prefix, { limit: 1000 });

    if (error) {
      console.error(`[deleteUserStorageFolder] list failed for ${prefix}`, error);
      continue;
    }

    for (const file of files ?? []) {
      if (file.id) {
        pathsToDelete.push(`${prefix}/${file.name}`);
      }
    }
  }

  if (pathsToDelete.length === 0) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .remove(pathsToDelete);

  if (removeError) {
    console.error("[deleteUserStorageFolder] remove failed", removeError);
    throw removeError;
  }
}
