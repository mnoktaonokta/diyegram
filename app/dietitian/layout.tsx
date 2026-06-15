import { auth } from "@/auth";
import { AppToaster } from "@/components/app-toaster";
import { DietitianSessionProvider } from "@/components/dietitian/dietitian-session-context";
import { DietitianFeedFilterProvider } from "@/components/dietitian/feed/dietitian-feed-filter-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { redirect } from "next/navigation";

export default async function DietitianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "DIETITIAN") {
    redirect("/login");
  }

  return (
    <DietitianSessionProvider userId={session.user.id}>
      <NotificationProvider audience="DIETITIAN">
        <DietitianFeedFilterProvider>{children}</DietitianFeedFilterProvider>
        <AppToaster />
      </NotificationProvider>
    </DietitianSessionProvider>
  );
}
