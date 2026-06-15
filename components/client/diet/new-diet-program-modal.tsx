"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

import { startNewDietProgramAction } from "@/app/actions/progress";
import { useClientDay } from "@/components/client/client-day-provider";
import { useClientClinicalData } from "@/components/client/clinical/use-client-clinical-data";
import { useClientProgressData } from "@/components/client/progress/use-client-progress-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchDietitians,
  type DietitianDirectoryEntry,
} from "@/lib/mock/dietitian-directory";
import { cn } from "@/lib/utils";

export function NewDietProgramModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dietitianQuery, setDietitianQuery] = useState("");
  const [selectedDietitian, setSelectedDietitian] =
    useState<DietitianDirectoryEntry | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startWeight, setStartWeight] = useState("");
  const [startFatPercentage, setStartFatPercentage] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetFatPercentage, setTargetFatPercentage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { refreshClinical } = useClientClinicalData();
  const { refreshProgress } = useClientProgressData();
  const { refreshActivity, refreshMeals } = useClientDay();

  const suggestions = useMemo(
    () => searchDietitians(dietitianQuery),
    [dietitianQuery],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function resetForm() {
    setDietitianQuery("");
    setSelectedDietitian(null);
    setShowSuggestions(false);
    setStartWeight("");
    setStartFatPercentage("");
    setTargetWeight("");
    setTargetFatPercentage("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function selectDietitian(entry: DietitianDirectoryEntry) {
    setSelectedDietitian(entry);
    setDietitianQuery(entry.name);
    setShowSuggestions(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDietitian) {
      toast.error("Lütfen listeden bir diyetisyen seçin.");
      return;
    }

    const parsedStartWeight = Number(startWeight.replace(",", "."));
    const parsedStartFat = Number(startFatPercentage.replace(",", "."));
    const parsedTargetWeight = Number(targetWeight.replace(",", "."));
    const parsedTargetFat = Number(targetFatPercentage.replace(",", "."));

    if (!Number.isFinite(parsedStartWeight) || parsedStartWeight <= 0) {
      toast.error("Geçerli bir başlangıç kilosu girin.");
      return;
    }

    if (!Number.isFinite(parsedStartFat) || parsedStartFat <= 0 || parsedStartFat > 100) {
      toast.error("Geçerli bir başlangıç yağ oranı girin.");
      return;
    }

    if (!Number.isFinite(parsedTargetWeight) || parsedTargetWeight <= 0) {
      toast.error("Geçerli bir hedef kilo girin.");
      return;
    }

    if (!Number.isFinite(parsedTargetFat) || parsedTargetFat <= 0 || parsedTargetFat > 100) {
      toast.error("Geçerli bir hedef yağ oranı girin.");
      return;
    }

    setIsSubmitting(true);

    const result = await startNewDietProgramAction({
      dietitian: {
        id: selectedDietitian.id,
        name: selectedDietitian.name,
      },
      startWeight: parsedStartWeight,
      startFatPercentage: parsedStartFat,
      targetWeight: parsedTargetWeight,
      targetFatPercentage: parsedTargetFat,
    });

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    refreshClinical();
    refreshProgress();
    void refreshActivity();
    void refreshMeals();
    router.refresh();
    toast.success("Yeni diyet programınız başlatıldı");
    setIsSubmitting(false);
    handleClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Kapat"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                Yeni Diyete Başla
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(92dvh-56px)] space-y-4 overflow-y-auto px-4 py-4 pb-8"
            >
              <div ref={containerRef} className="relative space-y-2">
                <Label htmlFor="dietitian-search">Diyetisyen seç</Label>
                <Input
                  id="dietitian-search"
                  value={dietitianQuery}
                  onChange={(event) => {
                    setDietitianQuery(event.target.value);
                    setSelectedDietitian(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="İsim yazmaya başlayın..."
                  autoComplete="off"
                  className="rounded-2xl"
                />
                {showSuggestions && suggestions.length > 0 ? (
                  <div className="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    {suggestions.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => selectDietitian(entry)}
                        className={cn(
                          "flex w-full flex-col items-start px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                          selectedDietitian?.id === entry.id &&
                            "bg-teal-50 dark:bg-teal-950/30",
                        )}
                      >
                        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                          {entry.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          {entry.specialty}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-weight">Başlangıç kilosu</Label>
                  <Input
                    id="start-weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="1"
                    value={startWeight}
                    onChange={(event) => setStartWeight(event.target.value)}
                    placeholder="88"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-fat">Başlangıç yağ oranı</Label>
                  <Input
                    id="start-fat"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="1"
                    max="100"
                    value={startFatPercentage}
                    onChange={(event) => setStartFatPercentage(event.target.value)}
                    placeholder="28.5"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-weight">Hedef kilo</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="1"
                    value={targetWeight}
                    onChange={(event) => setTargetWeight(event.target.value)}
                    placeholder="78"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-fat">Hedef yağ oranı</Label>
                  <Input
                    id="target-fat"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="1"
                    max="100"
                    value={targetFatPercentage}
                    onChange={(event) => setTargetFatPercentage(event.target.value)}
                    placeholder="22"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-2xl text-sm font-semibold"
              >
                {isSubmitting ? "Kaydediliyor..." : "Programı Başlat"}
              </Button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
