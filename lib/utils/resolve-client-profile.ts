import type { ClientProfile } from "@/lib/mock/dietitian-data";

export function applyPublicProfileToClient(client: ClientProfile): ClientProfile {
  return client;
}

export function getClientPersonalInfoLabel(
  client: Pick<ClientProfile, "personalInfoLabel">,
) {
  return client.personalInfoLabel ?? null;
}
