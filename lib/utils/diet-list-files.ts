import { compressMealImage } from "@/lib/utils/compress-meal-image";
import type { DietListFile, DietListFileType } from "@/lib/types/client-diet-list";

const MAX_PDF_BYTES = 4 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}

function createFileId() {
  return `dlf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function processDietListFile(file: File): Promise<DietListFile> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type.startsWith("image/");

  if (!isPdf && !isImage) {
    throw new Error("Yalnızca görsel veya PDF yükleyebilirsiniz.");
  }

  if (isPdf && file.size > MAX_PDF_BYTES) {
    throw new Error("PDF dosyası en fazla 4 MB olabilir.");
  }

  const dataUrl = isImage
    ? await compressMealImage(file)
    : await readFileAsDataUrl(file);

  return {
    id: createFileId(),
    type: (isPdf ? "pdf" : "image") as DietListFileType,
    dataUrl,
    fileName: file.name,
  };
}

export async function processDietListFiles(files: File[]) {
  return Promise.all(files.map((file) => processDietListFile(file)));
}

export function triggerFileDownload(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
