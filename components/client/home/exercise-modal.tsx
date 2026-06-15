"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Save, X } from "lucide-react";

import { useClientDay } from "@/components/client/client-day-provider";
import { showExerciseSavedToast } from "@/components/client/home/client-action-toasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EXERCISE_CATEGORIES,
  type ExerciseCategoryId,
} from "@/lib/mock/client-data";
import { cn } from "@/lib/utils";

function ExerciseForm({ onClose }: { onClose: () => void }) {
  const { addExercise } = useClientDay();
  const [selectedCategory, setSelectedCategory] =
    useState<ExerciseCategoryId | null>(null);
  const [detail, setDetail] = useState("");

  const trimmedDetail = detail.trim();
  const canSave = trimmedDetail.length > 0;

  function handleSave() {
    if (!canSave) {
      return;
    }

    const category = EXERCISE_CATEGORIES.find(
      (item) => item.id === selectedCategory,
    );

    addExercise({
      categoryId: category?.id,
      categoryLabel: category?.label ?? trimmedDetail,
      emoji: category?.emoji ?? "🏃",
      detail: trimmedDetail,
    });

    onClose();
    showExerciseSavedToast();
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div>
          <h2
            id="exercise-modal-title"
            className="text-lg font-bold text-slate-800 dark:text-zinc-100"
          >
            Egzersiz Ekle
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Kategori seç, süre veya miktar gir ve kaydet
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-zinc-400"
          aria-label="Kapat"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 gap-2">
          {EXERCISE_CATEGORIES.map((category) => {
            const selected = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setSelectedCategory((current) =>
                    current === category.id ? null : category.id,
                  )
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors",
                  selected
                    ? "border-amber-400 bg-amber-400/15 text-amber-700 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-zinc-400",
                )}
              >
                <span className="text-xl">{category.emoji}</span>
                <span className="text-[10px] font-semibold leading-tight">
                  {category.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div>
          <label
            htmlFor="exercise-detail"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400"
          >
            Süre / Miktar
          </label>
          <Input
            id="exercise-detail"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Örn: 45 dk, 6000 adım veya serbest yazın..."
            className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <Button
          type="button"
          size="lg"
          disabled={!canSave}
          className="h-12 w-full rounded-2xl bg-amber-400 text-sm font-semibold text-amber-950 hover:bg-amber-400/90 disabled:opacity-50"
          onClick={handleSave}
        >
          <Save className="size-4" />
          Egzersizi Kaydet
        </Button>
      </div>
    </>
  );
}

export function ExerciseModal() {
  const { isExerciseModalOpen, closeExerciseModal, exerciseOpenSessionId } =
    useClientDay();

  return (
    <AnimatePresence>
      {isExerciseModalOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            onClick={closeExerciseModal}
            aria-label="Egzersiz ekranını kapat"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-modal-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-md rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-center pt-3">
              <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <ExerciseForm
              key={exerciseOpenSessionId}
              onClose={closeExerciseModal}
            />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
