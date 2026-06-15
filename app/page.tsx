import Link from "next/link";

import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
            D
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Diyegram</p>
            <p className="text-xs text-muted-foreground">
              Beslenme takip uygulaması
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-md">
          <h1 className="text-2xl font-bold text-foreground">
            Sağlıklı yaşam yolculuğuna başla
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Diyetisyenin veya danışan hesabınla giriş yaparak devam et.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {session?.user ? (
              <Link
                href={
                  session.user.role === "DIETITIAN" ? "/dietitian" : "/client"
                }
                className="inline-flex h-9 w-full items-center justify-center rounded-2xl bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                Panele Git
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 w-full items-center justify-center rounded-2xl bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 w-full items-center justify-center rounded-2xl border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
