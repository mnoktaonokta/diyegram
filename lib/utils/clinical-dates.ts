import { parseDateKey, todayKey } from "@/lib/utils/calendar";

export function getDaysUntilDate(dateKey: string) {
  const today = parseDateKey(todayKey());
  const target = parseDateKey(dateKey);
  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatTurkishLongDate(dateKey: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

export function formatTurkishShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
  }).format(parseDateKey(dateKey));
}

export function formatDietListLabel(date: Date) {
  return `${new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
  }).format(date)} Diyet Listesi`;
}
