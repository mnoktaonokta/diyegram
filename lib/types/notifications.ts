export type NotificationAudience = "CLIENT" | "DIETITIAN";

export type AppNotification = {
  id: string;
  audience: NotificationAudience;
  message: string;
  timeLabel: string;
  read: boolean;
  href: string;
  postId?: string;
};
