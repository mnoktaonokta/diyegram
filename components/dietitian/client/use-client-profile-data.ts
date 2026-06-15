"use client";

import { useEffect, useState } from "react";

import {
  getClientMealCalendarForDietitianAction,
  getClientMealsForDietitianAction,
} from "@/app/actions/meal";
import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";
import type { WeekDay } from "@/lib/utils/calendar";
import { todayKey } from "@/lib/utils/calendar";

export function useClientProfileData(clientId: string, initialDate?: string) {
  const [calendarDays, setCalendarDays] = useState<WeekDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate ?? todayKey());
  const [dailyPosts, setDailyPosts] = useState<DietitianFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      const calendarResult =
        await getClientMealCalendarForDietitianAction(clientId);

      if (cancelled) {
        return;
      }

      if (calendarResult.success) {
        setCalendarDays(calendarResult.data);

        const defaultDate =
          initialDate ??
          calendarResult.data.find((day) => day.isToday)?.date ??
          todayKey();

        setSelectedDate((current) => {
          if (initialDate) {
            return initialDate;
          }

          return calendarResult.data.some((day) => day.date === current)
            ? current
            : defaultDate;
        });
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, initialDate]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await getClientMealsForDietitianAction({
        clientId,
        dateKey: selectedDate,
      });

      if (!cancelled && result.success) {
        setDailyPosts(result.data);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, isLoading, refreshToken, selectedDate]);

  return {
    calendarDays,
    selectedDate,
    setSelectedDate,
    dailyPosts,
    isLoading,
    refreshPosts: () => setRefreshToken((token) => token + 1),
  };
}
