"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import type { WeekDay } from "@/lib/utils/calendar";
import { cn } from "@/lib/utils";

type WeeklyCalendarPickerProps = {
  days: WeekDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  highlightedDate?: string;
  className?: string;
};

export function WeeklyCalendarPicker({
  days,
  selectedDate,
  onSelectDate,
  highlightedDate,
  className,
}: WeeklyCalendarPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const selectedEl = selectedRef.current;

    if (!container || !selectedEl) {
      return;
    }

    const scrollToSelected = () => {
      const targetScroll =
        selectedEl.offsetLeft -
        container.clientWidth / 2 +
        selectedEl.offsetWidth / 2;
      const maxScroll = container.scrollWidth - container.clientWidth;

      container.scrollLeft = Math.max(0, Math.min(targetScroll, maxScroll));
    };

    const frame = requestAnimationFrame(() => {
      scrollToSelected();
      requestAnimationFrame(scrollToSelected);
    });

    return () => cancelAnimationFrame(frame);
  }, [days, selectedDate]);

  return (
    <div className={cn("flex justify-center px-4 pt-4", className)}>
      <div
        ref={scrollRef}
        className="inline-flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isAppointment = Boolean(
            highlightedDate && day.date === highlightedDate,
          );

          return (
            <motion.button
              key={day.date}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              disabled={day.isFuture}
              whileTap={day.isFuture ? undefined : { scale: 0.96 }}
              onClick={() => {
                if (!day.isFuture) {
                  onSelectDate(day.date);
                }
              }}
              className={cn(
                "flex min-w-[52px] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-colors",
                day.isFuture && "cursor-not-allowed opacity-50",
                isSelected
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-zinc-400 dark:shadow-none",
                isAppointment &&
                  !isSelected &&
                  "ring-2 ring-teal-500 ring-offset-2 ring-offset-slate-50 dark:ring-teal-400 dark:ring-offset-slate-950",
                isAppointment &&
                  isSelected &&
                  "ring-2 ring-white/80 ring-offset-2 ring-offset-teal-500",
              )}
            >
              <span className="text-xs font-medium">{day.dayLabel}</span>
              <span
                className={cn(
                  "text-lg font-bold leading-none",
                  isSelected
                    ? "text-white"
                    : isAppointment
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-800 dark:text-zinc-100",
                )}
              >
                {day.dayNumber}
              </span>
              {isAppointment ? (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-teal-500",
                  )}
                />
              ) : day.hasMeals ? (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isSelected ? "bg-white/80" : "bg-teal-500",
                  )}
                />
              ) : (
                <span className="size-1.5" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}