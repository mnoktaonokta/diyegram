export type WeekDay = {
  date: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  hasMeals: boolean;
  isFuture: boolean;
};

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  // UTC öğlen: PostgreSQL DATE + yerel saat dilimi kaymasını önler
  return new Date(Date.UTC(year!, month! - 1, day!, 12, 0, 0, 0));
}

export function todayKey() {
  return formatDateKey(new Date());
}

export function daysAgoKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateKey(date);
}

export function monthsAgoKey(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatDateKey(date);
}

export function daysAheadKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export const CALENDAR_FUTURE_BUFFER_DAYS = 4;

export function getCalendarEndDate(futureBufferDays = CALENDAR_FUTURE_BUFFER_DAYS) {
  return daysAheadKey(futureBufferDays);
}

export function getEndOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  result.setDate(result.getDate() + daysUntilSunday);
  return result;
}

export function buildCalendarDays({
  startDate,
  endDate,
  datesWithMeals = new Set<string>(),
}: {
  startDate: string;
  endDate?: string;
  datesWithMeals?: Set<string>;
}): WeekDay[] {
  const today = todayKey();
  const end = endDate ?? getCalendarEndDate();
  const cursor = parseDateKey(startDate);
  const endDateParsed = parseDateKey(end);
  const days: WeekDay[] = [];

  while (cursor <= endDateParsed) {
    const dateStr = formatDateKey(cursor);

    days.push({
      date: dateStr,
      dayLabel: DAY_NAMES[cursor.getDay()]!,
      dayNumber: cursor.getDate(),
      isToday: dateStr === today,
      hasMeals: datesWithMeals.has(dateStr),
      isFuture: dateStr > today,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/** @deprecated buildCalendarDays kullanın */
export function buildWeekDays(datesWithMeals: Set<string> = new Set()): WeekDay[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 3);

  return buildCalendarDays({
    startDate: formatDateKey(start),
    endDate: getCalendarEndDate(),
    datesWithMeals,
  });
}
