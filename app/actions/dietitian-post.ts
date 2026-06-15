"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  mapDietitianPost,
  mapGenderFromDb,
  mapUserToDietitianPublicProfile,
} from "@/lib/profile/mappers";
import { prisma } from "@/lib/prisma";
import type { DietitianSocialPost } from "@/lib/types/dietitian-social";
import { sanitizeImageUrls } from "@/lib/types/dietitian-social";
import {
  formatStorageError,
  getFormDataFiles,
  getFormDataString,
  uploadFilesToStorage,
} from "@/lib/supabase/storage";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DietitianSocialProfileSnapshot = {
  dietitianId: string;
  name: string;
  avatarUrl: string;
  gender: "male" | "female" | "other" | "";
  title: string;
  bio: string;
  posts: DietitianSocialPost[];
};

const dietitianProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
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

function revalidateSocialPaths() {
  revalidatePath("/dietitian/profile");
  revalidatePath("/client/dietitian-profile");
  revalidatePath("/dietitian");
  revalidatePath("/client");
}

async function resolveDietitianIdForViewer(session: Awaited<ReturnType<typeof requireSession>>) {
  if (session.user.role === "DIETITIAN") {
    return session.user.id;
  }

  const client = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { assignedDietitianId: true },
  });

  return client?.assignedDietitianId ?? null;
}

async function loadSocialProfile(
  dietitianId: string,
): Promise<DietitianSocialProfileSnapshot | null> {
  const [dietitian, posts] = await Promise.all([
    prisma.user.findFirst({
      where: {
        id: dietitianId,
        role: "DIETITIAN",
      },
      select: dietitianProfileSelect,
    }),
    prisma.dietitianPost.findMany({
      where: { dietitianId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!dietitian) {
    return null;
  }

  const publicProfile = mapUserToDietitianPublicProfile(dietitian);

  return {
    dietitianId,
    name: publicProfile.name,
    avatarUrl: publicProfile.avatarUrl,
    gender: mapGenderFromDb(dietitian.gender),
    title: publicProfile.title,
    bio: publicProfile.bio,
    posts: posts.map(mapDietitianPost),
  };
}

export async function getDietitianSocialProfileAction(): Promise<
  ActionResult<DietitianSocialProfileSnapshot>
> {
  try {
    const session = await requireSession();
    const dietitianId = await resolveDietitianIdForViewer(session);

    if (!dietitianId) {
      return { success: false, error: "Bağlı diyetisyen bulunamadı" };
    }

    const profile = await loadSocialProfile(dietitianId);

    if (!profile) {
      return { success: false, error: "Diyetisyen profili bulunamadı" };
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error("[getDietitianSocialProfileAction]", error);
    return { success: false, error: "Sosyal profil yüklenemedi" };
  }
}

export async function createDietitianPostAction(
  formData: FormData,
): Promise<ActionResult<DietitianSocialPost>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler paylaşım yapabilir" };
    }

    const title = getFormDataString(formData, "title") || "Paylaşım";
    const description = getFormDataString(formData, "description");
    const files = getFormDataFiles(formData, "images");

    if (files.length === 0) {
      return {
        success: false,
        error: "Fotoğraf dosyası sunucuya ulaşmadı. Daha küçük bir görsel deneyin.",
      };
    }

    let imageUrls: string[] = [];
    try {
      imageUrls = sanitizeImageUrls(
        await uploadFilesToStorage(files, {
          userId: session.user.id,
          folder: "dietitian-posts",
        }),
      );
    } catch (uploadError) {
      console.error("[createDietitianPostAction] upload failed", uploadError);
      return {
        success: false,
        error: formatStorageError(uploadError),
      };
    }

    if (imageUrls.length === 0) {
      return { success: false, error: "En az bir geçerli fotoğraf gerekli" };
    }

    const post = await prisma.dietitianPost.create({
      data: {
        dietitianId: session.user.id,
        imageUrls,
        title,
        description,
      },
    });

    revalidateSocialPaths();

    return {
      success: true,
      data: mapDietitianPost(post),
    };
  } catch (error) {
    console.error("[createDietitianPostAction]", error);
    return { success: false, error: "İçerik paylaşılamadı" };
  }
}
