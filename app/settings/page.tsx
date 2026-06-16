import { auth } from "@/auth";
import { AppToaster } from "@/components/app-toaster";
import { SettingsPage } from "@/components/settings/settings-page";
import { SettingsShell } from "@/components/settings/settings-shell";
import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import { mapUserToProfileSettings, resolveProfileAvatarUrl } from "@/lib/profile/mappers";
import { toImageSrc } from "@/lib/utils/image-src";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsRoutePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/settings");
  }

  const role = session.user.role;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      age: true,
      height: true,
      gender: true,
      avatarUrl: true,
      professionalTitle: true,
      bio: true,
    },
  });

  const profile = user
    ? mapUserToProfileSettings(user)
    : null;
  const avatarUrl = profile
    ? toImageSrc(resolveProfileAvatarUrl(profile, role))
    : toImageSrc(getDefaultAvatarForGender());

  return (
    <>
      <SettingsShell
        role={role}
        userName={profile ? `${profile.firstName} ${profile.lastName}`.trim() : session.user.name ?? "Kullanıcı"}
        userEmail={session.user.email}
        avatarUrl={avatarUrl}
      >
        <SettingsPage
          userEmail={session.user.email}
          role={role}
        />
      </SettingsShell>
      <AppToaster />
    </>
  );
}
