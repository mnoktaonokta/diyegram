import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { AppLoginLogo } from "@/components/shared/app-login-logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-md">
        <div className="mb-6 text-center">
          <AppLoginLogo className="mb-4" />
          <p className="text-sm text-muted-foreground">Hesabına giriş yap</p>
        </div>

        <Suspense fallback={<div className="text-sm text-muted-foreground">Yükleniyor...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
