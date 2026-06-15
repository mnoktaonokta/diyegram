"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChartLine, FileText, Home, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/client", label: "Ana Sayfa", icon: Home, exact: true },
  { href: "/client/diet-list", label: "Diyetim", icon: FileText, exact: false },
  {
    href: "/client/progress",
    label: "Gelişimim",
    icon: ChartLine,
    exact: false,
  },
] as const;

export function ClientBottomBar() {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-slate-50/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-slate-500 dark:text-zinc-400",
              )}
            >
              <motion.div whileTap={{ scale: 0.96 }}>
                <Icon
                  className={cn(
                    "size-5",
                    isActive && "fill-teal-600/15 dark:fill-teal-400/15",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span className={cn("font-medium", isActive && "font-bold")}>
                {label}
              </span>
            </Link>
          );
        })}

        <Link
          href="/settings"
          aria-label="Ayarlar"
          className={cn(
            "flex flex-1 flex-col items-center rounded-2xl px-1 py-2 transition-colors",
            isSettingsActive
              ? "text-teal-600 dark:text-teal-400"
              : "text-slate-500 dark:text-zinc-400",
          )}
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <Settings
              className={cn(
                "size-5",
                isSettingsActive && "fill-teal-600/15 dark:fill-teal-400/15",
              )}
              strokeWidth={isSettingsActive ? 2.5 : 2}
            />
          </motion.div>
        </Link>

        <button
          type="button"
          aria-label="Çıkış yap"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-1 flex-col items-center rounded-2xl px-1 py-2 text-slate-500 transition-colors hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <LogOut className="size-5" strokeWidth={2} />
          </motion.div>
        </button>
      </div>
    </nav>
  );
}
