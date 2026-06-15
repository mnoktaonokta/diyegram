"use client";

import { useState } from "react";

import { ClinicalUpdateCard } from "@/components/client/diet/clinical-update-card";
import { DietListArchiveSection } from "@/components/client/diet/diet-list-archive-section";
import { NewDietProgramModal } from "@/components/client/diet/new-diet-program-modal";
import { FruitExchangeDrawer } from "@/components/client/fruit-exchange-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClientDietListPage() {
  const [newDietOpen, setNewDietOpen] = useState(false);
  const [fruitExchangeOpen, setFruitExchangeOpen] = useState(false);

  return (
    <div className="px-4 pb-6 pt-4">
      <header className="relative mb-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            Diyetim
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Klinik sonrası güncelleme merkeziniz
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewDietOpen(true)}
          className={cn(
            "absolute right-0 top-0 rounded-full border border-slate-200 bg-white px-3 py-1.5",
            "text-[11px] font-semibold text-slate-700 shadow-sm transition-colors",
            "hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200",
            "dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300",
          )}
        >
          Yeni Diyete Başla
        </button>
      </header>

      <Button
        type="button"
        variant="outline"
        onClick={() => setFruitExchangeOpen(true)}
        className="mb-5 h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-100 dark:hover:bg-slate-800"
      >
        <span aria-hidden>🍎</span>
        Meyve Değişimleri
      </Button>

      <DietListArchiveSection />
      <ClinicalUpdateCard />

      <NewDietProgramModal
        open={newDietOpen}
        onClose={() => setNewDietOpen(false)}
      />

      <FruitExchangeDrawer
        open={fruitExchangeOpen}
        onClose={() => setFruitExchangeOpen(false)}
      />
    </div>
  );
}
