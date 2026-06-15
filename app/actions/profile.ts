"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  formatProfileDisplayName,
  mapGenderToDb,
  mapUserToProfileSettings,
  parseProfileAge,
  parseProfileHeight,
} from "@/lib/profile/mappers";
import { prisma } from "@/lib/prisma";
import { deleteUserStorageFolder } from "@/lib/supabase/storage";
import type { UserProfileSettings } from "@/lib/types/user-profile";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const profileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  age: true,
  height: true,
  gender: true,
  avatarUrl: true,
  professionalTitle: true,
  bio: true,
} as const;

async function requireSession() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Oturum gerekli");
  }

  return session;
}

function revalidateProfilePaths() {
  revalidatePath("/settings");
  revalidatePath("/client");
  revalidatePath("/dietitian");
  revalidatePath("/dietitian/profile");
  revalidatePath("/client/dietitian-profile");
}

export async function getProfileAction(): Promise<
  ActionResult<UserProfileSettings>
> {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: profileSelect,
    });

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    return {
      success: true,
      data: mapUserToProfileSettings(user),
    };
  } catch (error) {
    console.error("[getProfileAction]", error);
    return { success: false, error: "Profil yüklenemedi" };
  }
}

export async function updateProfileAction(
  input: UserProfileSettings,
): Promise<
  ActionResult<{ profile: UserProfileSettings; displayName: string }>
> {
  try {
    const session = await requireSession();

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    if (!firstName) {
      return { success: false, error: "Ad alanı zorunludur" };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        age: parseProfileAge(input.age),
        height: parseProfileHeight(input.height),
        gender: mapGenderToDb(input.gender),
        avatarUrl: input.avatarUrl || null,
        ...(session.user.role === "DIETITIAN"
          ? {
              professionalTitle: input.professionalTitle.trim() || null,
              bio: input.bio.trim() || null,
            }
          : {}),
      },
      select: profileSelect,
    });

    revalidateProfilePaths();

    const profile = mapUserToProfileSettings(user);

    return {
      success: true,
      data: {
        profile,
        displayName: formatProfileDisplayName(profile),
      },
    };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { success: false, error: "Profil kaydedilemedi" };
  }
}

export async function updatePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<{ updated: true }>> {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Mevcut şifre hatalı" };
    }

    const hashed = await bcrypt.hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return { success: true, data: { updated: true } };
  } catch (error) {
    console.error("[updatePasswordAction]", error);
    return { success: false, error: "Şifre güncellenemedi" };
  }
}

export async function deleteAccountAction(input: {
  password: string;
}): Promise<ActionResult<{ deleted: true }>> {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const password = input.password.trim();

    if (!password) {
      return { success: false, error: "Hesabı silmek için şifrenizi girin" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "Şifre hatalı" };
    }

    try {
      await deleteUserStorageFolder(userId);
    } catch (storageError) {
      console.error("[deleteAccountAction] storage cleanup failed", storageError);
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { authorId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    revalidateProfilePaths();

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("[deleteAccountAction]", error);
    return { success: false, error: "Hesap silinemedi" };
  }
}
