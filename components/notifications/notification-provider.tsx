"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getNotificationsAction } from "@/app/actions/notifications";
import {
  applyReadStateToNotifications,
  markAllNotificationsAsRead,
  markNotificationRead,
} from "@/lib/storage/notifications-storage";
import type { AppNotification, NotificationAudience } from "@/lib/types/notifications";

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  audience,
  children,
}: {
  audience: NotificationAudience;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [optimisticUnreadCount, setOptimisticUnreadCount] = useState<
    number | null
  >(null);

  const refreshNotifications = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      setOptimisticUnreadCount(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setOptimisticUnreadCount(null);

    void (async () => {
      const result = await getNotificationsAction();

      if (cancelled) {
        return;
      }

      if (result.success) {
        const scoped = result.data.filter((item) => item.audience === audience);
        setNotifications(applyReadStateToNotifications(userId, scoped));
      } else {
        setNotifications([]);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [audience, refreshToken, userId]);

  const storedUnreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const unreadCount = optimisticUnreadCount ?? storedUnreadCount;

  const markAsRead = useCallback(
    (id: string) => {
      if (!userId) {
        return;
      }

      markNotificationRead(userId, id);
      setOptimisticUnreadCount((current) => {
        if (current == null) {
          return Math.max(0, storedUnreadCount - 1);
        }

        return Math.max(0, current - 1);
      });
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    [storedUnreadCount, userId],
  );

  const markAllAsRead = useCallback(() => {
    if (!userId) {
      return;
    }

    setOptimisticUnreadCount(0);
    markAllNotificationsAsRead(
      userId,
      notifications.map((notification) => notification.id),
    );
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }, [notifications, userId]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    }),
    [
      isLoading,
      markAllAsRead,
      markAsRead,
      notifications,
      refreshNotifications,
      unreadCount,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
