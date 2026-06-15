"use client";

import { useMemo } from "react";

import { useProfileRevisionValue } from "@/components/providers/user-profile-provider";
import type { ClientProfile } from "@/lib/mock/dietitian-data";
import { applyPublicProfileToClient } from "@/lib/utils/resolve-client-profile";

export function useResolvedClientProfile(client: ClientProfile) {
  const profileRevision = useProfileRevisionValue();

  return useMemo(() => {
    void profileRevision;
    return applyPublicProfileToClient(client);
  }, [client, profileRevision]);
}
