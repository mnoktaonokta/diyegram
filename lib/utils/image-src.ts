export function resolveImageSrc(
  src: string | null | undefined,
  fallback?: string,
): string | null {
  const trimmed = src?.trim();
  if (trimmed) {
    return trimmed;
  }

  const fallbackTrimmed = fallback?.trim();
  return fallbackTrimmed || null;
}

export function shouldSkipImageOptimization(src: string) {
  return (
    src.startsWith("data:") ||
    src.endsWith(".svg") ||
    (src.startsWith("/") && !src.startsWith("//"))
  );
}
