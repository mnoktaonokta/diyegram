import {
  buildClientPostHref,
  buildDietitianClientPostHref,
} from "@/lib/utils/notification-links";
import { daysAgoKey, todayKey } from "@/lib/utils/calendar";

import type { AppNotification } from "@/lib/types/notifications";

const today = todayKey();
const yesterday = daysAgoKey(1);

export const MOCK_CLIENT_NOTIFICATIONS: Omit<AppNotification, "read">[] = [
  {
    id: "cn-1",
    audience: "CLIENT",
    message: "Diyetisyenin öğününü beğendi ❤️",
    timeLabel: "5 dk önce",
    href: buildClientPostHref("seed-meal-1", today),
    postId: "seed-meal-1",
  },
  {
    id: "cn-2",
    audience: "CLIENT",
    message: "Diyetisyen yorum yaptı: Porsiyonu biraz küçültelim 💬",
    timeLabel: "1 saat önce",
    href: buildClientPostHref("seed-meal-y-2", yesterday),
    postId: "seed-meal-y-2",
  },
  {
    id: "cn-3",
    audience: "CLIENT",
    message: "Diyetisyen yorum yaptı: Harika gidiyorsun! 👏",
    timeLabel: "Dün",
    href: buildClientPostHref("seed-meal-2", today),
    postId: "seed-meal-2",
  },
];

export const MOCK_DIETITIAN_NOTIFICATIONS: Omit<AppNotification, "read">[] = [
  {
    id: "dn-1",
    audience: "DIETITIAN",
    message: "Mehmet Demir yorum yaptı 💬",
    timeLabel: "10 dk önce",
    href: buildDietitianClientPostHref("client-1", "h1-4", yesterday),
    postId: "h1-4",
  },
  {
    id: "dn-2",
    audience: "DIETITIAN",
    message: "Mehmet Demir yorumuna yanıt verdi 💬",
    timeLabel: "25 dk önce",
    href: buildDietitianClientPostHref("client-1", "seed-meal-2", today),
    postId: "seed-meal-2",
  },
  {
    id: "dn-3",
    audience: "DIETITIAN",
    message: "🚨 Ayşe Kaya yeni bir kaçamak itirafında bulundu!",
    timeLabel: "35 dk önce",
    href: buildDietitianClientPostHref("client-2", "h2-cheat", yesterday),
    postId: "h2-cheat",
  },
  {
    id: "dn-4",
    audience: "DIETITIAN",
    message: "Can Yıldız öğün fotoğrafı paylaştı 📸",
    timeLabel: "2 saat önce",
    href: buildDietitianClientPostHref("client-3", "h3-1", today),
    postId: "h3-1",
  },
];
