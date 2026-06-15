"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLine, FileText, Home } from "lucide-react";
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-slate-50/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition-colors",
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
      </div>
    </nav>
  );
}
