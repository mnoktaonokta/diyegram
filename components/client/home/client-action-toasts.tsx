"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const TOAST_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

const TOAST_DURATION = 3200;

type AnimatedToastProps = {
  message: string;
  className?: string;
  shake?: boolean;
};

function AnimatedToast({ message, className, shake = false }: AnimatedToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        ...(shake ? { x: [0, -6, 6, -5, 5, -2, 2, 0] } : {}),
      }}
      transition={{
        ...TOAST_SPRING,
        ...(shake
          ? {
              x: { duration: 0.5, ease: "easeInOut" },
            }
          : {}),
      }}
      className={cn(
        "pointer-events-auto w-[min(100vw-2rem,20rem)] rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg",
        className,
      )}
    >
      {message}
    </motion.div>
  );
}

function showAnimatedToast(
  message: string,
  className: string,
  options?: { shake?: boolean },
) {
  toast.custom(
    () => (
      <AnimatedToast
        message={message}
        className={className}
        shake={options?.shake}
      />
    ),
    { duration: TOAST_DURATION },
  );
}

export function showWaterAddedToast() {
  showAnimatedToast(
    "Harika! 1 bardak su eklendi 💧",
    "border border-sky-300/80 bg-sky-500 text-white shadow-sky-500/25 dark:border-sky-700 dark:bg-sky-600",
  );
}

export function showExerciseSavedToast() {
  showAnimatedToast(
    "Egzersiz kaydedildi, harika gidiyorsun! 🏃",
    "border border-amber-300/80 bg-amber-400 text-amber-950 shadow-amber-400/25 dark:border-amber-600 dark:bg-amber-500 dark:text-amber-950",
  );
}

/** @deprecated showExerciseSavedToast kullanın */
export function showStepsAddedToast() {
  showExerciseSavedToast();
}

export function showCheatConfessionReceivedToast() {
  showAnimatedToast(
    "Kaçamak itirafı alındı. Diyetisyenin bunu görecek! 🚨",
    "border border-rose-400 bg-rose-500 text-white shadow-rose-500/30",
    { shake: true },
  );
}

/** @deprecated showCheatConfessionReceivedToast kullanın */
export function showCheatConfessionToast() {
  showCheatConfessionReceivedToast();
}

export function showPostAddedToast() {
  showAnimatedToast(
    "Gönderi eklendi",
    "border border-teal-300/80 bg-teal-500 text-white shadow-teal-500/25 dark:border-teal-700 dark:bg-teal-600",
  );
}

export function showMealUploadToast() {
  showAnimatedToast(
    "Öğün yükleme ekranı açılıyor...",
    "border border-slate-200/80 bg-white text-slate-800 shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-100",
  );
}
