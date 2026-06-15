"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDietitianSocialProfileAction,
  type DietitianSocialProfileSnapshot,
} from "@/app/actions/dietitian-post";

const EMPTY_SNAPSHOT: DietitianSocialProfileSnapshot = {
  dietitianId: "",
  name: "Diyetisyen",
  avatarUrl: "",
  gender: "",
  title: "",
  bio: "",
  posts: [],
};

export function useDietitianSocialProfile() {
  const [snapshot, setSnapshot] =
    useState<DietitianSocialProfileSnapshot>(EMPTY_SNAPSHOT);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSocialProfile = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSnapshot(EMPTY_SNAPSHOT);

    void (async () => {
      const result = await getDietitianSocialProfileAction();

      if (cancelled) {
        return;
      }

      if (result.success) {
        setSnapshot(result.data);
      } else {
        setSnapshot(EMPTY_SNAPSHOT);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    ...snapshot,
    revision: refreshToken,
    isLoading,
    refreshSocialProfile,
  };
}
