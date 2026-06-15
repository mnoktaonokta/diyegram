import { auth } from "@/auth";
import { DietitianSocialProfileView } from "@/components/dietitian/social/dietitian-social-profile-view";
import { DietitianShell } from "@/components/dietitian/dietitian-shell";
import { redirect } from "next/navigation";

export default async function DietitianSocialProfilePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "DIETITIAN") {
    redirect("/login");
  }

  return (
    <DietitianShell
      title="Sosyal Profil"
      userName={session.user.name ?? "Diyetisyen"}
      userEmail={session.user.email}
    >
      <DietitianSocialProfileView
        canEdit
        backHref="/dietitian"
        backLabel="Akışa Dön"
      />
    </DietitianShell>
  );
}
