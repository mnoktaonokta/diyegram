"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="rounded-2xl"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Çıkış Yap
    </Button>
  );
}
