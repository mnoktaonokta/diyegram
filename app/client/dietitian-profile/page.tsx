import { auth } from "@/auth";
import { DietitianSocialProfileView } from "@/components/dietitian/social/dietitian-social-profile-view";
import { redirect } from "next/navigation";

export default async function ClientDietitianProfilePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  return (
    <DietitianSocialProfileView
      canEdit={false}
      backHref="/client"
      backLabel="Ana Sayfaya Dön"
    />
  );
}
