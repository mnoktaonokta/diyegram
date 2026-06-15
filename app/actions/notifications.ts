"use server";

import { auth } from "@/auth";
import { dateToDateKey } from "@/lib/meal/date";
import { formatFeedTimeAgo } from "@/lib/meal/time-ago";
import { prisma } from "@/lib/prisma";
import type {
  AppNotification,
  NotificationAudience,
} from "@/lib/types/notifications";
import {
  buildClientPostHref,
  buildDietitianClientPostHref,
} from "@/lib/utils/notification-links";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type NotificationSeed = Omit<AppNotification, "read"> & {
  createdAt: Date;
};

function truncateText(text: string, maxLength = 48) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

function formatClientName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Danışan";
}

async function loadClientNotifications(userId: string): Promise<NotificationSeed[]> {
  const [feedbackMeals, dietitianComments] = await Promise.all([
    prisma.mealPost.findMany({
      where: {
        userId,
        dietitianFeedback: { in: ["LIKED", "DISLIKED"] },
      },
      select: {
        id: true,
        date: true,
        dietitianFeedback: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.comment.findMany({
      where: {
        authorRole: "DIETITIAN",
        mealPost: { userId },
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        mealPost: {
          select: {
            id: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const notifications: NotificationSeed[] = [];

  for (const meal of feedbackMeals) {
    const dateKey = dateToDateKey(meal.date);
    notifications.push({
      id: `feedback-${meal.id}-${meal.dietitianFeedback}`,
      audience: "CLIENT",
      message:
        meal.dietitianFeedback === "LIKED"
          ? "Diyetisyenin öğününü beğendi ❤️"
          : "Diyetisyen öğününüz hakkında geri bildirim verdi 👎",
      timeLabel: formatFeedTimeAgo(meal.updatedAt),
      href: buildClientPostHref(meal.id, dateKey),
      postId: meal.id,
      createdAt: meal.updatedAt,
    });
  }

  for (const comment of dietitianComments) {
    const dateKey = dateToDateKey(comment.mealPost.date);
    notifications.push({
      id: `comment-${comment.id}`,
      audience: "CLIENT",
      message: `Diyetisyen yorum yaptı: ${truncateText(comment.text)} 💬`,
      timeLabel: formatFeedTimeAgo(comment.createdAt),
      href: buildClientPostHref(comment.mealPost.id, dateKey),
      postId: comment.mealPost.id,
      createdAt: comment.createdAt,
    });
  }

  return notifications;
}

async function loadDietitianNotifications(
  dietitianId: string,
): Promise<NotificationSeed[]> {
  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      assignedDietitianId: dietitianId,
    },
    select: { id: true },
  });

  const clientIds = clients.map((client) => client.id);

  if (clientIds.length === 0) {
    return [];
  }

  const [meals, clientComments] = await Promise.all([
    prisma.mealPost.findMany({
      where: { userId: { in: clientIds } },
      select: {
        id: true,
        date: true,
        isCheat: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.comment.findMany({
      where: {
        authorRole: "CLIENT",
        mealPost: { userId: { in: clientIds } },
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        mealPost: {
          select: {
            id: true,
            date: true,
            userId: true,
          },
        },
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const notifications: NotificationSeed[] = [];

  for (const meal of meals) {
    const dateKey = dateToDateKey(meal.date);
    const clientName = formatClientName(meal.user.firstName, meal.user.lastName);

    notifications.push({
      id: `meal-${meal.id}`,
      audience: "DIETITIAN",
      message: meal.isCheat
        ? `🚨 ${clientName} yeni bir kaçamak itirafında bulundu!`
        : `${clientName} öğün fotoğrafı paylaştı 📸`,
      timeLabel: formatFeedTimeAgo(meal.createdAt),
      href: buildDietitianClientPostHref(meal.user.id, meal.id, dateKey),
      postId: meal.id,
      createdAt: meal.createdAt,
    });
  }

  for (const comment of clientComments) {
    const dateKey = dateToDateKey(comment.mealPost.date);
    const clientName = comment.author
      ? formatClientName(comment.author.firstName, comment.author.lastName)
      : "Danışan";

    notifications.push({
      id: `comment-${comment.id}`,
      audience: "DIETITIAN",
      message: `${clientName} yorum yaptı: ${truncateText(comment.text)} 💬`,
      timeLabel: formatFeedTimeAgo(comment.createdAt),
      href: buildDietitianClientPostHref(
        comment.mealPost.userId,
        comment.mealPost.id,
        dateKey,
      ),
      postId: comment.mealPost.id,
      createdAt: comment.createdAt,
    });
  }

  return notifications;
}

export async function getNotificationsAction(): Promise<
  ActionResult<Omit<AppNotification, "read">[]>
> {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: "Oturum gerekli" };
    }

    const audience = session.user.role as NotificationAudience;
    const seeds =
      audience === "CLIENT"
        ? await loadClientNotifications(session.user.id)
        : await loadDietitianNotifications(session.user.id);

    const notifications = seeds
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 30)
      .map(({ createdAt: _createdAt, ...notification }) => notification);

    return { success: true, data: notifications };
  } catch (error) {
    console.error("[getNotificationsAction]", error);
    return { success: false, error: "Bildirimler yüklenemedi" };
  }
}
