"use client";

import { SessionProvider } from "next-auth/react";
import type { ComponentProps } from "react";

import { UserProfileProvider } from "@/components/providers/user-profile-provider";
import { ProfileOnboardingGate } from "@/components/onboarding/profile-onboarding-gate";

export function AuthSessionProvider({
  children,
}: ComponentProps<typeof SessionProvider>) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <UserProfileProvider>
        <ProfileOnboardingGate>{children}</ProfileOnboardingGate>
      </UserProfileProvider>
    </SessionProvider>
  );
}
