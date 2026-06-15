import { auth } from "@/auth";
import { DietitianFeedView } from "@/components/dietitian/feed/dietitian-feed-view";
import { DietitianShell } from "@/components/dietitian/dietitian-shell";
import { MOCK_CLIENTS } from "@/lib/mock/dietitian-data";
import { redirect } from "next/navigation";

export default async function DietitianDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "DIETITIAN") {
    redirect("/login");
  }

  return (
    <DietitianShell
      userName={session.user.name ?? "Diyetisyen"}
      userEmail={session.user.email}
      variant="feed"
      clients={MOCK_CLIENTS}
    >
      <DietitianFeedView />
    </DietitianShell>
  );
}
