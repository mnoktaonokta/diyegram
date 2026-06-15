"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      offset={{ bottom: "1.5rem" }}
      mobileOffset={{ bottom: "1.5rem" }}
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-100",
          success: "border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-300",
          error: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
        },
        duration: 3200,
      }}
    />
  );
}
