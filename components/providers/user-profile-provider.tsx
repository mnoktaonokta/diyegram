"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProfileAction } from "@/app/actions/profile";
import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import {
  formatProfileDisplayName,
  formatProfileFirstName,
  resolveProfileAvatarUrl,
} from "@/lib/profile/mappers";
import type { UserProfileSettings } from "@/lib/types/user-profile";
import type { Role } from "@/types/role";

type UserProfileContextValue = {
  profile: UserProfileSettings | null;
  displayName: string;
  firstName: string;
  avatarUrl: string;
  profileRevision: number;
  refreshProfile: () => void;
  isLoading: boolean;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfileSettings | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !session.user.role) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setProfile(null);

    void (async () => {
      const result = await getProfileAction();

      if (cancelled) {
        return;
      }

      if (result.success) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, session?.user?.id, session?.user?.role]);

  const role = (session?.user?.role as Role) ?? "CLIENT";

  const displayName = isLoading
    ? ""
    : profile
      ? formatProfileDisplayName(profile)
      : session?.user?.name ?? "Kullanıcı";

  const firstName = isLoading
    ? ""
    : profile
      ? formatProfileFirstName(profile)
      : session?.user?.name?.split(" ")[0] ?? "Kullanıcı";

  const avatarUrl = isLoading
    ? getDefaultAvatarForGender(profile?.gender)
    : resolveProfileAvatarUrl(profile, role);

  const value = useMemo(
    () => ({
      profile,
      displayName,
      firstName,
      avatarUrl,
      profileRevision: refreshToken,
      refreshProfile,
      isLoading,
    }),
    [
      avatarUrl,
      displayName,
      firstName,
      isLoading,
      profile,
      refreshProfile,
      refreshToken,
    ],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }

  return context;
}

export function useOptionalUserProfile() {
  return useContext(UserProfileContext);
}

export function useProfileRevisionValue() {
  const context = useContext(UserProfileContext);
  return context?.profileRevision ?? 0;
}
