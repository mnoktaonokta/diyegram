import {
  parseProfileAge,
  parseProfileHeight,
} from "@/lib/profile/mappers";
import type { UserProfileSettings } from "@/lib/types/user-profile";

export function isProfileOnboardingComplete(
  profile: UserProfileSettings | null | undefined,
) {
  if (!profile) {
    return false;
  }

  const hasAge = parseProfileAge(profile.age) != null;
  const hasHeight = parseProfileHeight(profile.height) != null;
  const hasGender =
    profile.gender === "male" ||
    profile.gender === "female" ||
    profile.gender === "other";

  return hasAge && hasHeight && hasGender;
}
