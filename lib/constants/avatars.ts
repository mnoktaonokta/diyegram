import type { Gender } from "@/lib/generated/prisma/client";
import type { GenderOption } from "@/lib/types/user-profile";

export const DEFAULT_MALE_AVATAR = "/progress-samples/anonymous_male.png";
export const DEFAULT_FEMALE_AVATAR = "/progress-samples/anonymous_female.jpg";

/** @deprecated Use getDefaultAvatarForGender instead */
export const DEFAULT_CLIENT_AVATAR = DEFAULT_MALE_AVATAR;

/** @deprecated Use getDefaultAvatarForGender instead */
export const DEFAULT_DIETITIAN_AVATAR = DEFAULT_FEMALE_AVATAR;

export function getDefaultAvatarForGender(
  gender?: GenderOption | Gender | null,
): string {
  if (gender === "female" || gender === "FEMALE") {
    return DEFAULT_FEMALE_AVATAR;
  }

  return DEFAULT_MALE_AVATAR;
}
