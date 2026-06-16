"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type SwitchProps = Omit<ComponentProps<"button">, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full border border-transparent p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 shrink-0 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
