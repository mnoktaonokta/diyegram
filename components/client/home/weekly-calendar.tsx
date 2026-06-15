"use client";

import { useMemo } from "react";

import { useClientDay } from "@/components/client/client-day-provider";
import { useClientClinicalData } from "@/components/client/clinical/use-client-clinical-data";
import { WeeklyCalendarPicker } from "@/components/shared/weekly-calendar-picker";
import { buildCalendarDays } from "@/lib/utils/calendar";

export function WeeklyCalendar() {
  const { calendarDays, selectedDate, setSelectedDate } = useClientDay();
  const { clinical, isLoading } = useClientClinicalData();

  const visibleDays = useMemo(() => {
    const appointmentDate = clinical?.nextAppointmentDate;
    const lastVisibleDate = calendarDays.at(-1)?.date;

    if (!appointmentDate || !lastVisibleDate || appointmentDate <= lastVisibleDate) {
      return calendarDays;
    }

    const datesWithMeals = new Set(
      calendarDays.filter((day) => day.hasMeals).map((day) => day.date),
    );

    return buildCalendarDays({
      startDate: calendarDays[0]?.date ?? appointmentDate,
      endDate: appointmentDate,
      datesWithMeals,
    });
  }, [calendarDays, clinical?.nextAppointmentDate]);

  return (
    <WeeklyCalendarPicker
      days={visibleDays}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      highlightedDate={
        isLoading || !clinical?.nextAppointmentDate
          ? undefined
          : clinical.nextAppointmentDate
      }
    />
  );
}
