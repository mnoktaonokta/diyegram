"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ClientProfileHeader } from "@/components/dietitian/client/client-profile-header";
import { DietitianDailyMealFeed } from "@/components/dietitian/client/dietitian-daily-meal-feed";
import { useResolvedClientProfile } from "@/components/dietitian/client/use-resolved-client-profile";
import { useClientProfileData } from "@/components/dietitian/client/use-client-profile-data";
import { WeeklyCalendarPicker } from "@/components/shared/weekly-calendar-picker";
import type { ClientProfile } from "@/lib/mock/dietitian-data";

function ClientProfilePageContent({ client }: { client: ClientProfile }) {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? undefined;
  const resolvedClient = useResolvedClientProfile(client);

  const { calendarDays, selectedDate, setSelectedDate, dailyPosts, isLoading, refreshPosts } =
    useClientProfileData(resolvedClient.id, initialDate);

  return (
    <>
      <div className="px-4 pt-3">
        <Link
          href="/dietitian"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400"
        >
          <ArrowLeft className="size-4" />
          Akışa Dön
        </Link>
      </div>

      <ClientProfileHeader client={resolvedClient} />

      <WeeklyCalendarPicker
        days={calendarDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        className="pt-3"
      />

      {isLoading ? (
        <div className="mx-4 mt-6 rounded-2xl border border-slate-200 bg-white/60 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-zinc-400">
          Günlük kayıtlar yükleniyor...
        </div>
      ) : (
        <DietitianDailyMealFeed posts={dailyPosts} onMutate={refreshPosts} />
      )}
    </>
  );
}

function ClientProfilePageKeyed({ client }: { client: ClientProfile }) {
  const searchParams = useSearchParams();
  const deepLinkKey = `${searchParams.get("date") ?? ""}-${searchParams.get("post") ?? ""}`;

  return <ClientProfilePageContent key={deepLinkKey} client={client} />;
}

export function ClientProfilePage({ client }: { client: ClientProfile }) {
  return (
    <Suspense fallback={null}>
      <ClientProfilePageKeyed client={client} />
    </Suspense>
  );
}
