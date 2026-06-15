"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Droplets,
  Dumbbell,
  Plus,
  X,
} from "lucide-react";

import { useClientDay } from "@/components/client/client-day-provider";
import { useMealUpload } from "@/components/client/meal-upload-provider";
import { showWaterAddedToast } from "@/components/client/home/client-action-toasts";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 22 };

const FAB_ACTIONS = [
  {
    id: "meal",
    label: "Öğün Ekle",
    icon: Camera,
    className: "bg-teal-500 text-white shadow-md",
  },
  {
    id: "water",
    label: "Su Ekle",
    icon: Droplets,
    className: "bg-sky-500 text-white shadow-md",
  },
  {
    id: "exercise",
    label: "Egzersiz Ekle",
    icon: Dumbbell,
    className: "bg-amber-400 text-white shadow-md",
  },
] as const;

export function SpeedDialFab() {
  const [isOpen, setIsOpen] = useState(false);
  const { addWaterGlass, openExerciseModal } = useClientDay();
  const { openMealUpload } = useMealUpload();

  function handleAction(actionId: (typeof FAB_ACTIONS)[number]["id"]) {
    setIsOpen(false);

    switch (actionId) {
      case "water":
        addWaterGlass();
        showWaterAddedToast();
        break;
      case "exercise":
        openExerciseModal();
        break;
      case "meal":
        openMealUpload();
        break;
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] dark:bg-black/40"
            onClick={() => setIsOpen(false)}
            aria-label="Menüyü kapat"
          />
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md">
        <div className="relative flex justify-end px-4">
          <AnimatePresence>
            {isOpen
              ? FAB_ACTIONS.map((action, index) => {
                  const Icon = action.icon;

                  return (
                    <motion.button
                      key={action.id}
                      type="button"
                      initial={{ opacity: 0, y: 20, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        y: -(index + 1) * 60,
                        scale: 1,
                      }}
                      exit={{ opacity: 0, y: 10, scale: 0.5 }}
                      transition={{
                        ...SPRING,
                        delay: index * 0.04,
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        "pointer-events-auto absolute bottom-0 right-4 flex items-center gap-2 rounded-2xl px-3 py-2",
                        action.className,
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="whitespace-nowrap text-xs font-semibold">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })
              : null}
          </AnimatePresence>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={SPRING}
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "pointer-events-auto flex size-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg",
              isOpen && "bg-slate-700 dark:bg-slate-600",
            )}
            aria-label={isOpen ? "Menüyü kapat" : "Hızlı eylemler"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="size-6" strokeWidth={2.5} />
            ) : (
              <Plus className="size-7" strokeWidth={2.5} />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
