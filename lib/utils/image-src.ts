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

export function getValidImageUrls(images: string[]): string[] {
  return images
    .map((image) => resolveImageSrc(image))
    .filter((image): image is string => Boolean(image));
}

export function isStaticImageData(
  value: unknown,
): value is import("next/image").StaticImageData {
  return (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    "height" in value &&
    "width" in value
  );
}

export function toImageSrc(value: string | import("next/image").StaticImageData): string {
  return typeof value === "string" ? value : value.src;
}

export function resolveProgressImageSrc(
  src: string | null | undefined,
): string | null {
  const trimmed = src?.trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (normalized.startsWith("/progress-samples/")) {
    return normalized;
  }

  if (/^(male|female)-\d+\.png$/i.test(trimmed)) {
    return `/progress-samples/${trimmed}`;
  }

  if (/^progress-samples\//i.test(trimmed)) {
    return `/${trimmed}`;
  }

  return normalized;
}

export function shouldSkipImageOptimization(src: string) {
  return (
    src.startsWith("data:") ||
    src.endsWith(".svg") ||
    (src.startsWith("/") && !src.startsWith("//"))
  );
}
