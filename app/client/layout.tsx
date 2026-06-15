import { Suspense } from "react";
import { auth } from "@/auth";
import { ClientDayProvider } from "@/components/client/client-day-provider";
import { ClientDeepLinkHandler } from "@/components/client/client-deep-link-handler";
import { ClientShell } from "@/components/client/client-shell";
import { ClientToaster } from "@/components/client/client-toaster";
import { MealUploadDrawer } from "@/components/client/home/meal-upload-drawer";
import { MealUploadProvider } from "@/components/client/meal-upload-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  return (
    <NotificationProvider audience="CLIENT">
      <ClientDayProvider>
        <Suspense fallback={null}>
          <ClientDeepLinkHandler />
        </Suspense>
        <MealUploadProvider>
          <ClientShell
            userName={session.user.name ?? "Danışan"}
            userEmail={session.user.email}
          >
            {children}
          </ClientShell>
          <MealUploadDrawer />
          <ClientToaster />
        </MealUploadProvider>
      </ClientDayProvider>
    </NotificationProvider>
  );
}
