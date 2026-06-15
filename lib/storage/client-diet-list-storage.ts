import type { DietListUpload } from "@/lib/types/client-diet-list";
import { formatDietListLabel } from "@/lib/utils/clinical-dates";

const LEGACY_STORAGE_KEY = "diyegram:client-diet-list-uploads";

const listeners = new Set<() => void>();
let revisionCounter = 0;

function getStorageKey(userId: string) {
  return `${LEGACY_STORAGE_KEY}:${userId}`;
}

export function getClientDietListRevision() {
  return revisionCounter;
}

export function subscribeClientDietList(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function notifyChange() {
  revisionCounter += 1;
  listeners.forEach((listener) => listener());
}

function migrateLegacyUploads(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const scopedKey = getStorageKey(userId);
  if (window.localStorage.getItem(scopedKey)) {
    return;
  }

  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) {
    return;
  }

  window.localStorage.setItem(scopedKey, legacy);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function loadRaw(userId: string): DietListUpload[] {
  if (typeof window === "undefined" || !userId) {
    return [];
  }

  migrateLegacyUploads(userId);

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as DietListUpload[];
  } catch {
    return [];
  }
}

export function loadClientDietListUploads(userId: string): DietListUpload[] {
  return loadRaw(userId).sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export function saveClientDietListUploads(
  userId: string,
  uploads: DietListUpload[],
) {
  if (typeof window === "undefined" || !userId) {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(uploads));
  notifyChange();
}

export function addClientDietListUpload(
  userId: string,
  files: DietListUpload["files"],
): DietListUpload {
  const uploadedAt = new Date().toISOString();
  const entry: DietListUpload = {
    id: `diet-list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uploadedAt,
    label: formatDietListLabel(new Date(uploadedAt)),
    files,
  };

  saveClientDietListUploads(userId, [entry, ...loadRaw(userId)]);
  return entry;
}
