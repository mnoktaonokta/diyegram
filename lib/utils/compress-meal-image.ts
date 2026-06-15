const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

export async function compressMealImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / bitmap.width,
    MAX_DIMENSION / bitmap.height,
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas context unavailable");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
