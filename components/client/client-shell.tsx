import { ClientBottomBar } from "@/components/client/client-bottom-bar";
import { ClientHeader } from "@/components/client/client-header";

export function ClientShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail?: string | null;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 dark:bg-slate-950">
      <ClientHeader userName={userName} />
      <main className="flex-1 pb-24">{children}</main>
      <ClientBottomBar />
    </div>
  );
}
