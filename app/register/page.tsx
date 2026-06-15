import { RegisterForm } from "@/components/auth/register-form";
import { AppLoginLogo } from "@/components/shared/app-login-logo";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ dietitianId?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-md">
        <div className="mb-6 text-center">
          <AppLoginLogo className="mb-4" />
          <p className="text-sm text-muted-foreground">
            {params.dietitianId
              ? "Diyetisyen davetiyle hesabını oluştur"
              : "Hesabını oluştur"}
          </p>
        </div>

        <RegisterForm dietitianId={params.dietitianId} />
      </div>
    </div>
  );
}
