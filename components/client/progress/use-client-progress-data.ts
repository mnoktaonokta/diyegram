"use client";

import { useCallback, useEffect, useState } from "react";

import { getProgressSnapshotAction } from "@/app/actions/progress";
import type {
  ProgressDailyActivity,
  ProgressHistoryPoint,
} from "@/lib/mock/client-data";
import type { ProgressPhoto } from "@/lib/types/client-progress";

type ProgressSnapshot = {
  history: ProgressHistoryPoint[];
  activity: ProgressDailyActivity[];
  photos: ProgressPhoto[];
  revision: number;
};

const EMPTY_PROGRESS_SNAPSHOT: ProgressSnapshot = {
  history: [],
  activity: [],
  photos: [],
  revision: 0,
};

export function useClientProgressData() {
  const [snapshot, setSnapshot] =
    useState<ProgressSnapshot>(EMPTY_PROGRESS_SNAPSHOT);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProgress = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSnapshot(EMPTY_PROGRESS_SNAPSHOT);

    void (async () => {
      const result = await getProgressSnapshotAction();

      if (cancelled) {
        return;
      }

      if (result.success) {
        setSnapshot({
          history: result.data.history,
          activity: result.data.activity,
          photos: result.data.photos,
          revision: refreshToken,
        });
      } else {
        setSnapshot(EMPTY_PROGRESS_SNAPSHOT);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    history: snapshot.history,
    activity: snapshot.activity,
    photos: snapshot.photos,
    revision: snapshot.revision,
    isLoading,
    refreshProgress,
  };
}
