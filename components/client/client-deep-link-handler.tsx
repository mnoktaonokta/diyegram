"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useClientDay } from "@/components/client/client-day-provider";

export function ClientDeepLinkHandler() {
  const searchParams = useSearchParams();
  const { setSelectedDate } = useClientDay();

  useEffect(() => {
    const date = searchParams.get("date");
    if (date) {
      setSelectedDate(date);
    }
  }, [searchParams, setSelectedDate]);

  return null;
}
