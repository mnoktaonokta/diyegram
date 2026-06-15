import { auth } from "@/auth";
import { ClientProfilePage } from "@/components/dietitian/client/client-profile-page";
import { ResolvedClientTitle } from "@/components/dietitian/client/resolved-client-title";
import { DietitianShell } from "@/components/dietitian/dietitian-shell";
import { getClientProfileForDietitian } from "@/lib/meal/client-profile";
import { getClientById } from "@/lib/mock/dietitian-data";
import { notFound, redirect } from "next/navigation";

export default async function DietitianClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "DIETITIAN") {
    redirect("/login");
  }

  const { id } = await params;
  const mockClient = getClientById(id);
  const client =
    mockClient ??
    (await getClientProfileForDietitian({
      clientId: id,
      dietitianId: session.user.id,
    }));

  if (!client) {
    notFound();
  }

  return (
    <DietitianShell
      title={<ResolvedClientTitle client={client} />}
      userName={session.user.name ?? "Diyetisyen"}
      userEmail={session.user.email}
    >
      <ClientProfilePage client={client} />
    </DietitianShell>
  );
}
