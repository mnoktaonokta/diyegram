"use client";

import type { ClientProfile } from "@/lib/mock/dietitian-data";
import { useResolvedClientProfile } from "@/components/dietitian/client/use-resolved-client-profile";

export function ResolvedClientTitle({ client }: { client: ClientProfile }) {
  const resolvedClient = useResolvedClientProfile(client);
  return resolvedClient.name;
}
