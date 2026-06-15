"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, LogOut, Settings, User } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dietitian", label: "Ana Sayfa", icon: Home, exact: true },
  {
    href: "/dietitian/profile",
    label: "Profil",
    icon: User,
    exact: false,
  },
  { href: "/settings", label: "Ayarlar", icon: Settings, exact: false },
] as const;

export function DietitianBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-2xl px-2 py-2.5 transition-colors",
                isActive
                  ? "text-teal-400"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              <motion.div whileTap={{ scale: 0.96 }}>
                <Icon
                  className={cn(
                    "size-5",
                    isActive && "fill-teal-400/15",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Çıkış yap"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-1 items-center justify-center rounded-2xl px-2 py-2.5 text-zinc-400 transition-colors hover:text-rose-400"
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <LogOut className="size-5" strokeWidth={2} />
          </motion.div>
        </button>
      </div>
    </nav>
  );
}
