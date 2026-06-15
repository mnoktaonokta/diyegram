"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type { MealTypeKey, ClientMealPost } from "@/lib/mock/client-data";
import type { DietitianFeedPost, FeedbackStatus } from "@/lib/mock/dietitian-data";
import { dateKeyToDate, dateToDateKey } from "@/lib/meal/date";
import {
  mapMealPostToClientMealPost,
  mapMealPostToDietitianFeedPost,
} from "@/lib/meal/mappers";
import { resolveClientUserId } from "@/lib/meal/resolve-client";
import { prisma } from "@/lib/prisma";
import {
  getFormDataFiles,
  getFormDataString,
  uploadFilesToStorage,
} from "@/lib/supabase/storage";
import { sanitizeImageUrls } from "@/lib/types/dietitian-social";
import { buildCalendarDays } from "@/lib/utils/calendar";
import { sortFeedPostsNewestFirst } from "@/lib/utils/feed-sort";
import type { WeekDay } from "@/lib/utils/calendar";

const mealPostInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      gender: true,
    },
  },
  comments: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireSession() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Oturum gerekli");
  }

  return session;
}

function revalidateMealPaths() {
  revalidatePath("/client");
  revalidatePath("/dietitian");
  revalidatePath("/dietitian/client", "layout");
}

export async function getClientMealsForDateAction(
  dateKey: string,
): Promise<ActionResult<ClientMealPost[]>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar erişebilir" };
    }

    const posts = await prisma.mealPost.findMany({
      where: {
        userId: session.user.id,
        date: dateKeyToDate(dateKey),
      },
      include: mealPostInclude,
      orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
    });

    return {
      success: true,
      data: posts.map(mapMealPostToClientMealPost),
    };
  } catch (error) {
    console.error("[getClientMealsForDateAction]", error);
    return { success: false, error: "Öğünler yüklenemedi" };
  }
}

export async function getClientMealDatesAction(): Promise<
  ActionResult<string[]>
> {
  try {
    const session = await requireSession();

    if (session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar erişebilir" };
    }

    const rows = await prisma.mealPost.findMany({
      where: { userId: session.user.id },
      select: { date: true },
      distinct: ["date"],
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      data: rows.map((row) => dateToDateKey(row.date)),
    };
  } catch (error) {
    console.error("[getClientMealDatesAction]", error);
    return { success: false, error: "Takvim verisi yüklenemedi" };
  }
}

export async function getClientMealCalendarAction(): Promise<
  ActionResult<WeekDay[]>
> {
  try {
    const session = await requireSession();

    if (session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar erişebilir" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { programStartedAt: true, createdAt: true },
    });

    const datesResult = await getClientMealDatesAction();
    const datesWithMeals = new Set(
      datesResult.success ? datesResult.data : [],
    );

    const startDate = user?.programStartedAt
      ? dateToDateKey(user.programStartedAt)
      : user?.createdAt
        ? dateToDateKey(user.createdAt)
        : dateToDateKey(new Date());

    return {
      success: true,
      data: buildCalendarDays({ startDate, datesWithMeals }),
    };
  } catch (error) {
    console.error("[getClientMealCalendarAction]", error);
    return { success: false, error: "Takvim yüklenemedi" };
  }
}

export async function getDietitianFeedPostsAction(): Promise<
  ActionResult<DietitianFeedPost[]>
> {
  try {
    const session = await requireSession();

    if (session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler erişebilir" };
    }

    const posts = await prisma.mealPost.findMany({
      where: {
        user: {
          assignedDietitianId: session.user.id,
        },
      },
      include: mealPostInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: sortFeedPostsNewestFirst(posts.map(mapMealPostToDietitianFeedPost)),
    };
  } catch (error) {
    console.error("[getDietitianFeedPostsAction]", error);
    return { success: false, error: "Akış yüklenemedi" };
  }
}

export async function getClientMealsForDietitianAction(input: {
  clientId: string;
  dateKey: string;
}): Promise<ActionResult<DietitianFeedPost[]>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler erişebilir" };
    }

    const clientUserId = await resolveClientUserId({
      clientId: input.clientId,
      dietitianId: session.user.id,
    });

    if (!clientUserId) {
      return { success: false, error: "Danışan bulunamadı" };
    }

    const posts = await prisma.mealPost.findMany({
      where: {
        userId: clientUserId,
        date: dateKeyToDate(input.dateKey),
      },
      include: mealPostInclude,
      orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
    });

    return {
      success: true,
      data: posts.map(mapMealPostToDietitianFeedPost),
    };
  } catch (error) {
    console.error("[getClientMealsForDietitianAction]", error);
    return { success: false, error: "Öğünler yüklenemedi" };
  }
}

export async function getClientMealCalendarForDietitianAction(
  clientId: string,
): Promise<ActionResult<WeekDay[]>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler erişebilir" };
    }

    const clientUserId = await resolveClientUserId({
      clientId,
      dietitianId: session.user.id,
    });

    if (!clientUserId) {
      return { success: false, error: "Danışan bulunamadı" };
    }

    const client = await prisma.user.findUnique({
      where: { id: clientUserId },
      select: { programStartedAt: true, createdAt: true },
    });

    const rows = await prisma.mealPost.findMany({
      where: { userId: clientUserId },
      select: { date: true },
      distinct: ["date"],
    });

    const datesWithMeals = new Set(rows.map((row) => dateToDateKey(row.date)));
    const startDate = client?.programStartedAt
      ? dateToDateKey(client.programStartedAt)
      : client?.createdAt
        ? dateToDateKey(client.createdAt)
        : dateToDateKey(new Date());

    return {
      success: true,
      data: buildCalendarDays({ startDate, datesWithMeals }),
    };
  } catch (error) {
    console.error("[getClientMealCalendarForDietitianAction]", error);
    return { success: false, error: "Takvim yüklenemedi" };
  }
}

export async function createMealPostAction(
  formData: FormData,
): Promise<ActionResult<ClientMealPost>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar öğün ekleyebilir" };
    }

    const dateKey = getFormDataString(formData, "dateKey");
    const mealType = getFormDataString(formData, "mealType") as MealTypeKey;
    const isCheat = getFormDataString(formData, "isCheat") === "true";
    const time = getFormDataString(formData, "time");
    const note = getFormDataString(formData, "note");

    if (!dateKey || !mealType) {
      return { success: false, error: "Eksik öğün bilgisi" };
    }

    const files = getFormDataFiles(formData, "images");
    let uploadedUrls: string[] = [];

    if (files.length > 0) {
      try {
        uploadedUrls = sanitizeImageUrls(
          await uploadFilesToStorage(files, {
            userId: session.user.id,
            folder: "meals",
          }),
        );
      } catch (uploadError) {
        console.error("[createMealPostAction] upload failed", uploadError);
      }
    }

    const date = dateKeyToDate(dateKey);
    const existing = await prisma.mealPost.findFirst({
      where: {
        userId: session.user.id,
        date,
        mealType,
        isCheat,
      },
      include: mealPostInclude,
    });

    let post;

    if (existing) {
      const mergedImages = sanitizeImageUrls([
        ...existing.images,
        ...uploadedUrls.filter((image) => !existing.images.includes(image)),
      ]);

      post = await prisma.mealPost.update({
        where: { id: existing.id },
        data: {
          images: mergedImages,
          note: note || existing.note,
          time: time || existing.time,
        },
        include: mealPostInclude,
      });
    } else {
      post = await prisma.mealPost.create({
        data: {
          userId: session.user.id,
          date,
          mealType,
          isCheat,
          isUserCreated: true,
          time: time || null,
          images: uploadedUrls,
          note: note || null,
        },
        include: mealPostInclude,
      });
    }

    revalidateMealPaths();

    return {
      success: true,
      data: mapMealPostToClientMealPost(post),
    };
  } catch (error) {
    console.error("[createMealPostAction]", error);
    return { success: false, error: "Öğün kaydedilemedi" };
  }
}

export async function deleteMealPostAction(
  mealPostId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "CLIENT") {
      return { success: false, error: "Yalnızca danışanlar silebilir" };
    }

    const post = await prisma.mealPost.findUnique({
      where: { id: mealPostId },
      select: { userId: true, isUserCreated: true },
    });

    if (!post || post.userId !== session.user.id) {
      return { success: false, error: "Öğün bulunamadı" };
    }

    if (!post.isUserCreated) {
      return { success: false, error: "Bu öğün silinemez" };
    }

    await prisma.mealPost.delete({ where: { id: mealPostId } });
    revalidateMealPaths();

    return { success: true, data: { id: mealPostId } };
  } catch (error) {
    console.error("[deleteMealPostAction]", error);
    return { success: false, error: "Öğün silinemedi" };
  }
}

export async function createMealCommentAction(
  mealPostId: string,
  text: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    const trimmed = text.trim();

    if (!trimmed) {
      return { success: false, error: "Yorum boş olamaz" };
    }

    const post = await prisma.mealPost.findUnique({
      where: { id: mealPostId },
      include: {
        user: {
          select: {
            id: true,
            assignedDietitianId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Öğün bulunamadı" };
    }

    const authorName =
      session.user.name ??
      [post.user.firstName, post.user.lastName].filter(Boolean).join(" ");

    if (session.user.role === "CLIENT") {
      if (post.userId !== session.user.id) {
        return { success: false, error: "Bu öğüne yorum yapamazsınız" };
      }

      const comment = await prisma.comment.create({
        data: {
          mealPostId,
          authorId: session.user.id,
          authorRole: "CLIENT",
          authorName: authorName || "Danışan",
          text: trimmed,
        },
      });

      revalidateMealPaths();
      return { success: true, data: { id: comment.id } };
    }

    if (session.user.role === "DIETITIAN") {
      if (post.user.assignedDietitianId !== session.user.id) {
        return { success: false, error: "Bu öğüne yorum yapamazsınız" };
      }

      const comment = await prisma.comment.create({
        data: {
          mealPostId,
          authorId: session.user.id,
          authorRole: "DIETITIAN",
          authorName: authorName || "Diyetisyen",
          text: trimmed,
        },
      });

      revalidateMealPaths();
      return { success: true, data: { id: comment.id } };
    }

    return { success: false, error: "Yetkisiz işlem" };
  } catch (error) {
    console.error("[createMealCommentAction]", error);
    return { success: false, error: "Yorum eklenemedi" };
  }
}

export async function updateMealFeedbackAction(
  mealPostId: string,
  feedback: FeedbackStatus,
): Promise<ActionResult<{ id: string; feedback: FeedbackStatus }>> {
  try {
    const session = await requireSession();

    if (session.user.role !== "DIETITIAN") {
      return { success: false, error: "Yalnızca diyetisyenler geri bildirim verebilir" };
    }

    const post = await prisma.mealPost.findUnique({
      where: { id: mealPostId },
      include: {
        user: {
          select: { assignedDietitianId: true },
        },
      },
    });

    if (!post || post.user.assignedDietitianId !== session.user.id) {
      return { success: false, error: "Öğün bulunamadı" };
    }

    const updated = await prisma.mealPost.update({
      where: { id: mealPostId },
      data: { dietitianFeedback: feedback },
      select: { id: true, dietitianFeedback: true },
    });

    revalidateMealPaths();

    return {
      success: true,
      data: {
        id: updated.id,
        feedback: updated.dietitianFeedback as FeedbackStatus,
      },
    };
  } catch (error) {
    console.error("[updateMealFeedbackAction]", error);
    return { success: false, error: "Geri bildirim kaydedilemedi" };
  }
}
