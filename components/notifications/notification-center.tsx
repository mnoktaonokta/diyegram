"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Heart } from "lucide-react";

import { useNotifications } from "@/components/notifications/notification-provider";
import type { AppNotification, NotificationAudience } from "@/lib/types/notifications";
import { cn } from "@/lib/utils";

export function NotificationCenter({
  audience,
}: {
  audience: NotificationAudience;
}) {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const subtitle = useMemo(() => {
    if (isLoading) {
      return "Bildirimler yükleniyor...";
    }

    if (notifications.length === 0) {
      return "Henüz bildirim yok";
    }

    if (unreadCount > 0) {
      return `${unreadCount} okunmamış bildirim`;
    }

    return "Tüm bildirimler okundu";
  }, [isLoading, notifications.length, unreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const Icon = audience === "CLIENT" ? Heart : Bell;

  function handleToggleOpen() {
    if (!open) {
      markAllAsRead();
    }

    setOpen((value) => !value);
  }

  function handleNotificationClick(notification: AppNotification) {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    setOpen(false);
    router.push(notification.href);
  }

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handleToggleOpen}
        className="relative flex size-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-slate-800"
        aria-label="Bildirimler"
        aria-expanded={open}
      >
        <Icon className="size-5" />
        {!isLoading && unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </motion.button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">
              Bildirimler
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                Yeni bir etkileşim olduğunda burada görünecek.
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left transition-colors",
                        notification.read
                          ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          : "bg-teal-500/10 hover:bg-teal-500/15 dark:bg-teal-500/15 dark:hover:bg-teal-500/20",
                      )}
                    >
                      <p className="text-sm leading-snug text-slate-800 dark:text-zinc-100">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        {notification.timeLabel}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
