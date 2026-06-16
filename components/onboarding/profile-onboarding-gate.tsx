"use client";

import { useSession } from "next-auth/react";

import { ProfileOnboardingModal } from "@/components/onboarding/profile-onboarding-modal";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { isProfileOnboardingComplete } from "@/lib/profile/onboarding";

export function ProfileOnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { profile, isLoading } = useUserProfile();

  const shouldShowOnboarding =
    status === "authenticated" &&
    !isLoading &&
    profile != null &&
    !isProfileOnboardingComplete(profile);

  return (
    <>
      {children}
      <ProfileOnboardingModal open={shouldShowOnboarding} />
    </>
  );
}
