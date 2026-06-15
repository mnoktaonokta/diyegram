"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";

import { useDietitianSession } from "@/components/dietitian/dietitian-session-context";
import { cn } from "@/lib/utils";

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function DietitianInviteButton({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: "header" | "profile";
}) {
  const dietitianSession = useDietitianSession();
  const { data: session } = useSession();
  const dietitianId = dietitianSession?.userId ?? session?.user?.id;
  const [copied, setCopied] = useState(false);

  async function handleCopyInviteLink() {
    if (!dietitianId) {
      toast.error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    const inviteUrl = `${window.location.origin}/register?dietitianId=${dietitianId}`;

    try {
      await copyTextToClipboard(inviteUrl);
      setCopied(true);
      toast.success("Link kopyalandı");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Link kopyalanamadı");
    }
  }

  if (variant === "profile") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => void handleCopyInviteLink()}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60",
          copied && "border-teal-400 bg-teal-100 dark:bg-teal-950/70",
          className,
        )}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Link Kopyalandı" : "🔗 Danışan Davet Et"}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => void handleCopyInviteLink()}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-slate-800",
        copied && "bg-teal-500/15 text-teal-600 dark:text-teal-400",
        className,
      )}
      aria-label="Danışan davet linki kopyala"
      title={copied ? "Link kopyalandı" : "Danışan Davet Et"}
    >
      {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
    </motion.button>
  );
}
