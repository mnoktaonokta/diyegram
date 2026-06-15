"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("E-posta veya şifre hatalı");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

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
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
