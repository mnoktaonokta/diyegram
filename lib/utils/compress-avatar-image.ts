const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

export async function compressAvatarImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const sourceSize = Math.min(bitmap.width, bitmap.height);
  const sx = Math.floor((bitmap.width - sourceSize) / 2);
  const sy = Math.floor((bitmap.height - sourceSize) / 2);
  const outputSize = Math.min(MAX_DIMENSION, sourceSize);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas context unavailable");
  }

  context.drawImage(
    bitmap,
    sx,
    sy,
    sourceSize,
    sourceSize,
    0,
    0,
    outputSize,
    outputSize,
  );
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
