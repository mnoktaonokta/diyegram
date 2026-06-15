import { RegisterForm } from "@/components/auth/register-form";

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
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            D
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kayıt Ol</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {params.dietitianId
              ? "Diyetisyen davetiyle Diyegram'a katıl"
              : "Diyegram'a katıl"}
          </p>
        </div>

        <RegisterForm dietitianId={params.dietitianId} />
      </div>
    </div>
  );
}
