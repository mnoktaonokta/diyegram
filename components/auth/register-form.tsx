"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GenderOption } from "@/lib/types/user-profile";
import { cn } from "@/lib/utils";

type AccountType = "DIETITIAN" | "CLIENT";

function RadioCard<T extends string>({
  name,
  value,
  currentValue,
  label,
  onChange,
}: {
  name: string;
  value: T;
  currentValue: T;
  label: string;
  onChange: (value: T) => void;
}) {
  const selected = currentValue === value;

  return (
    <label
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
        selected
          ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300"
          : "border-input bg-background text-muted-foreground hover:border-teal-300 hover:bg-teal-500/5",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="size-4 accent-teal-600"
      />
      {label}
    </label>
  );
}

export function RegisterForm({ dietitianId }: { dietitianId?: string }) {
  const router = useRouter();
  const isInviteRegistration = Boolean(dietitianId?.trim());

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountType>("CLIENT");
  const [gender, setGender] = useState<Extract<GenderOption, "male" | "female">>(
    "female",
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          gender,
          role: isInviteRegistration ? "CLIENT" : role,
          dietitianId: isInviteRegistration ? dietitianId : undefined,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }

      router.push("/login");
    } catch {
      setError("Kayıt sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isInviteRegistration ? (
        <p className="rounded-2xl bg-teal-500/10 px-3 py-2 text-sm text-teal-700 dark:text-teal-300">
          Bu bağlantı üzerinden danışan olarak kayıt olacaksınız ve diyetisyeninize
          otomatik bağlanacaksınız.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Ad Soyad</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Adınız Soyadınız"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Cinsiyet</Label>
        <div className="flex gap-2">
          <RadioCard
            name="gender"
            value="female"
            currentValue={gender}
            label="Kadın"
            onChange={setGender}
          />
          <RadioCard
            name="gender"
            value="male"
            currentValue={gender}
            label="Erkek"
            onChange={setGender}
          />
        </div>
      </div>

      {!isInviteRegistration ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <RadioCard
              name="accountType"
              value="CLIENT"
              currentValue={role}
              label="Danışan"
              onChange={setRole}
            />
            <RadioCard
              name="accountType"
              value="DIETITIAN"
              currentValue={role}
              label="Diyetisyen"
              onChange={setRole}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full rounded-2xl"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
