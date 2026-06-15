"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { fruitExchanges } from "@/lib/constants/fruit-exchanges";
import { cn } from "@/lib/utils";

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("tr");
}

export function FruitExchangeDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const filteredFruits = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) {
      return fruitExchanges;
    }

    return fruitExchanges.filter((fruit) =>
      normalizeSearch(fruit.name).includes(normalizedQuery),
    );
  }, [query]);

  function handleClose() {
    setQuery("");
    onClose();
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
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Meyve değişim listesini kapat"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fruit-exchange-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-slate-800 bg-slate-950 shadow-2xl"
          >
            <div className="flex justify-center pt-3">
              <span className="h-1 w-10 rounded-full bg-slate-700" />
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-4">
              <div>
                <h2
                  id="fruit-exchange-title"
                  className="text-lg font-bold text-slate-100"
                >
                  Meyve Değişim Listesi
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  1 porsiyon meyve karşılıkları
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                aria-label="Kapat"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-slate-800 px-4 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Meyve ara..."
                  className="h-11 w-full rounded-2xl border border-slate-800 bg-slate-900 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {filteredFruits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-400">
                  Aramanızla eşleşen meyve bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {filteredFruits.map((fruit) => (
                    <div
                      key={fruit.name}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl",
                        "border border-slate-800 bg-slate-900 px-3.5 py-3",
                        "shadow-sm transition-colors hover:border-slate-700",
                      )}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="text-lg" aria-hidden>
                          {fruit.emoji}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {fruit.name}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-xs text-slate-400">
                        {fruit.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 px-4 py-3">
              <p className="text-center text-[11px] text-slate-500">
                {filteredFruits.length} meyve listeleniyor
              </p>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
