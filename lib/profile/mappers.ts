import type { Gender } from "@/lib/generated/prisma/client";
import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import type { UserProfileSettings, GenderOption } from "@/lib/types/user-profile";
import type { DietitianPublicProfile, DietitianSocialPost } from "@/lib/types/dietitian-social";
import { sanitizeImageUrls } from "@/lib/types/dietitian-social";
import type { Role } from "@/types/role";

type ProfileUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  age: number | null;
  height: number | null;
  gender: Gender | null;
  avatarUrl: string | null;
  professionalTitle: string | null;
  bio: string | null;
};

export function getDefaultAvatarForRole(
  role: Role,
  gender?: GenderOption | Gender | null,
) {
  void role;
  return getDefaultAvatarForGender(gender);
}

export function mapGenderToDb(gender: GenderOption): Gender | null {
  switch (gender) {
    case "male":
      return "MALE";
    case "female":
      return "FEMALE";
    case "other":
      return "OTHER";
    default:
      return null;
  }
}

export function mapGenderFromDb(gender: Gender | null): GenderOption {
  switch (gender) {
    case "MALE":
      return "male";
    case "FEMALE":
      return "female";
    case "OTHER":
      return "other";
    default:
      return "";
  }
}

export function formatProfileDisplayName(
  profile: Pick<UserProfileSettings, "firstName" | "lastName">,
) {
  const fullName = [profile.firstName.trim(), profile.lastName.trim()]
    .filter(Boolean)
    .join(" ");

  return fullName || "Kullanıcı";
}

export function formatProfileFirstName(
  profile: Pick<UserProfileSettings, "firstName" | "lastName">,
) {
  return (
    profile.firstName.trim() ||
    formatProfileDisplayName(profile).split(" ")[0] ||
    "Kullanıcı"
  );
}

export function resolveProfileAvatarUrl(
  profile:
    | (Pick<UserProfileSettings, "avatarUrl" | "gender"> & {
        gender?: GenderOption;
      })
    | null
    | undefined,
  role: Role,
) {
  if (profile?.avatarUrl?.trim()) {
    return profile.avatarUrl.trim();
  }

  return getDefaultAvatarForRole(role, profile?.gender);
}

export function mapUserToProfileSettings(user: ProfileUser): UserProfileSettings {
  const gender = mapGenderFromDb(user.gender);

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age != null ? String(user.age) : "",
    height: user.height != null ? String(user.height) : "",
    gender,
    email: user.email,
    avatarUrl: user.avatarUrl?.trim() ?? "",
    professionalTitle: user.professionalTitle ?? "",
    bio: user.bio ?? "",
  };
}

export function mapUserToDietitianPublicProfile(
  user: Pick<
    ProfileUser,
    | "firstName"
    | "lastName"
    | "avatarUrl"
    | "role"
    | "professionalTitle"
    | "bio"
    | "gender"
  >,
): DietitianPublicProfile {
  const profile = mapUserToProfileSettings({
    ...user,
    id: "",
    email: "",
    age: null,
    height: null,
  });

  return {
    name: formatProfileDisplayName(profile),
    avatarUrl: resolveProfileAvatarUrl(profile, user.role),
    title: profile.professionalTitle,
    bio: profile.bio,
  };
}

export function mapDietitianPost(row: {
  id: string;
  imageUrls: string[];
  title: string;
  description: string;
  createdAt: Date;
}): DietitianSocialPost {
  return {
    id: row.id,
    imageUrls: sanitizeImageUrls(row.imageUrls),
    title: row.title,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

export function parseProfileAge(age: string) {
  const parsed = Number(age.trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

export function parseProfileHeight(height: string) {
  const parsed = Number(height.replace(",", ".").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
