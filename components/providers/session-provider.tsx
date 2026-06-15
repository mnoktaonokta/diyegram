"use client";

import { SessionProvider } from "next-auth/react";
import type { ComponentProps } from "react";

import { UserProfileProvider } from "@/components/providers/user-profile-provider";

export function AuthSessionProvider({
  children,
}: ComponentProps<typeof SessionProvider>) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <UserProfileProvider>{children}</UserProfileProvider>
    </SessionProvider>
  );
}
