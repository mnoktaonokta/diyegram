"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Upload, X } from "lucide-react";

import { useClientDay } from "@/components/client/client-day-provider";
import {
  showCheatConfessionReceivedToast,
  showPostAddedToast,
} from "@/components/client/home/client-action-toasts";
import {
  type UploadMealType,
  useMealUpload,
} from "@/components/client/meal-upload-provider";
import { Button } from "@/components/ui/button";
import {
  MEAL_TYPE_LABELS,
  formatCurrentTime,
  type MealTypeKey,
} from "@/lib/mock/client-data";
import { cn } from "@/lib/utils";

const UPLOAD_MEAL_OPTIONS: { value: MealTypeKey; label: string }[] = [
  { value: "BREAKFAST", label: MEAL_TYPE_LABELS.BREAKFAST },
  { value: "LUNCH", label: MEAL_TYPE_LABELS.LUNCH },
  { value: "SNACK_1", label: MEAL_TYPE_LABELS.SNACK_1 },
  { value: "DINNER", label: MEAL_TYPE_LABELS.DINNER },
  { value: "SNACK_2", label: MEAL_TYPE_LABELS.SNACK_2 },
];

function CheatToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-2.5 transition-colors",
        checked
          ? "border-rose-400 bg-rose-500/10 dark:border-rose-700 dark:bg-rose-500/15"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
      )}
    >
      <span
        className={cn(
          "text-sm font-semibold",
          checked
            ? "text-rose-600 dark:text-rose-400"
            : "text-slate-600 dark:text-zinc-400",
        )}
      >
        🚨 Bu bir kaçamak itirafıdır
      </span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 overflow-hidden rounded-full p-0.5 transition-colors",
          checked ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-600",
        )}
      >
        <span
          className={cn(
            "block size-5 shrink-0 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

function MealUploadForm({
  presetIsCheat,
  presetMealType,
  onClose,
}: {
  presetIsCheat: boolean;
  presetMealType: MealTypeKey | null;
  onClose: () => void;
}) {
  const { addMeal } = useClientDay();
  const [mealType, setMealType] = useState<UploadMealType>(
    presetMealType ?? "BREAKFAST",
  );
  const [isCheat, setIsCheat] = useState(presetIsCheat);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputId = useId();
  const galleryInputId = useId();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileSelect(file: File | undefined) {
    if (!file) {
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFileName(file.name);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    await addMeal({
      mealType,
      isCheat,
      time: formatCurrentTime(),
      imageFiles: selectedFile ? [selectedFile] : [],
      note: note.trim() || undefined,
    });

    setIsSubmitting(false);

    onClose();

    if (isCheat) {
      showCheatConfessionReceivedToast();
    } else {
      showPostAddedToast();
    }
  }

  return (
    <div className="flex max-h-[inherit] min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between px-5 pt-1 pb-3">
        <div>
          <h2
            id="meal-upload-title"
            className="text-lg font-bold text-slate-800 dark:text-zinc-100"
          >
            {isCheat ? "Kaçamak İtirafı" : "Öğün Yükle"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Fotoğraf ekle, öğünü seç ve kaydet
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

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            Öğün Saati
          </p>
          <div className="flex flex-wrap gap-2">
            {UPLOAD_MEAL_OPTIONS.map((option) => {
              const selected = mealType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMealType(option.value)}
                  className={cn(
                    "rounded-2xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    selected
                      ? "bg-teal-500 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-zinc-400",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
          <input
            ref={cameraInputRef}
            id={cameraInputId}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              void handleFileSelect(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <input
            ref={galleryInputRef}
            id={galleryInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void handleFileSelect(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Seçilen öğün fotoğrafı"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ImageIcon className="size-7 text-slate-300 dark:text-zinc-600" />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-zinc-500">
                  Fotoğraf ekle
                </p>
              </div>
            )}
            {isSubmitting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-slate-600 dark:bg-slate-900/70 dark:text-zinc-300">
                Yükleniyor...
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 p-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={isSubmitting}
              onClick={() => cameraInputRef.current?.click()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-300/80 bg-teal-500/10 text-sm font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-500/15 dark:text-teal-300"
            >
              <span>📸</span>
              Kamera
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={isSubmitting}
              onClick={() => galleryInputRef.current?.click()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-300"
            >
              <span>🖼️</span>
              Galeri
            </motion.button>
          </div>

          {fileName ? (
            <p className="truncate border-t border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-zinc-400">
              {fileName}
            </p>
          ) : null}
        </div>

        <CheatToggle checked={isCheat} onCheckedChange={setIsCheat} />

        <div>
          <label
            htmlFor="meal-note"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400"
          >
            Açıklama / Not
          </label>
          <textarea
            id="meal-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Yemeğini kısaca tarif et..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-teal-500/30 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-slate-800">
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          className={cn(
            "h-11 w-full rounded-2xl text-sm font-semibold",
            isCheat
              ? "bg-rose-500 text-white hover:bg-rose-500/90"
              : "bg-teal-500 text-white hover:bg-teal-500/90",
          )}
          onClick={handleSubmit}
        >
          <Upload className="size-4" />
          Yükle
        </Button>
      </div>
    </div>
  );
}

export function MealUploadDrawer() {
  const { isOpen, presetIsCheat, presetMealType, closeMealUpload, openSessionId } =
    useMealUpload();

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            onClick={closeMealUpload}
            aria-label="Yükleme ekranını kapat"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="meal-upload-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[78vh] max-w-md flex-col rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-center pt-3">
              <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <MealUploadForm
              key={openSessionId}
              presetIsCheat={presetIsCheat}
              presetMealType={presetMealType}
              onClose={closeMealUpload}
            />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
