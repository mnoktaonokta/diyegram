"use client";

import { useCallback, useEffect, useState } from "react";

import { getClinicalStateAction } from "@/app/actions/progress";
import type { ClientMotivationData } from "@/lib/mock/client-data";
import type { ClientClinicalState } from "@/lib/storage/client-clinical-storage";

type ClientClinicalSnapshot = {
  clinical: ClientClinicalState | null;
  motivation: ClientMotivationData | null;
  revision: number;
};

const EMPTY_CLINICAL_SNAPSHOT: ClientClinicalSnapshot = {
  clinical: null,
  motivation: null,
  revision: 0,
};

export function useClientClinicalData() {
  const [snapshot, setSnapshot] =
    useState<ClientClinicalSnapshot>(EMPTY_CLINICAL_SNAPSHOT);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshClinical = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSnapshot(EMPTY_CLINICAL_SNAPSHOT);

    void (async () => {
      const result = await getClinicalStateAction();

      if (cancelled) {
        return;
      }

      if (result.success) {
        setSnapshot({
          clinical: result.data.clinical,
          motivation: result.data.motivation,
          revision: refreshToken,
        });
      } else {
        setSnapshot(EMPTY_CLINICAL_SNAPSHOT);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    clinical: snapshot.clinical,
    motivation: snapshot.motivation,
    revision: snapshot.revision,
    isLoading,
    refreshClinical,
  };
}
