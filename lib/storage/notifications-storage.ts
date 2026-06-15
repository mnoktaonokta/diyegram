import type { AppNotification } from "@/lib/types/notifications";

const LEGACY_READ_IDS_KEY = "diyegram:notification-read-ids";

function getReadIdsKey(userId: string) {
  return `${LEGACY_READ_IDS_KEY}:${userId}`;
}

function loadReadIds(userId: string): Set<string> {
  if (typeof window === "undefined" || !userId) {
    return new Set();
  }

  migrateLegacyReadIds(userId);

  try {
    const raw = window.localStorage.getItem(getReadIdsKey(userId));
    if (!raw) {
      return new Set();
    }

    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function migrateLegacyReadIds(userId: string) {
  const scopedKey = getReadIdsKey(userId);
  if (window.localStorage.getItem(scopedKey)) {
    return;
  }

  const legacy = window.localStorage.getItem(LEGACY_READ_IDS_KEY);
  if (!legacy) {
    return;
  }

  window.localStorage.setItem(scopedKey, legacy);
  window.localStorage.removeItem(LEGACY_READ_IDS_KEY);
}

function saveReadIds(userId: string, ids: Set<string>) {
  if (typeof window === "undefined" || !userId) {
    return;
  }

  window.localStorage.setItem(getReadIdsKey(userId), JSON.stringify([...ids]));
}

export function applyReadStateToNotifications(
  userId: string,
  notifications: Omit<AppNotification, "read">[],
): AppNotification[] {
  const readIds = loadReadIds(userId);

  return notifications.map((notification) => ({
    ...notification,
    read: readIds.has(notification.id),
  }));
}

export function markNotificationRead(userId: string, id: string) {
  const readIds = loadReadIds(userId);
  readIds.add(id);
  saveReadIds(userId, readIds);
}

export function markAllNotificationsAsRead(
  userId: string,
  notificationIds: string[],
) {
  const readIds = loadReadIds(userId);

  for (const id of notificationIds) {
    readIds.add(id);
  }

  saveReadIds(userId, readIds);
}

export function clearNotificationReadState(userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (userId) {
    window.localStorage.removeItem(getReadIdsKey(userId));
    return;
  }

  window.localStorage.removeItem(LEGACY_READ_IDS_KEY);
}
