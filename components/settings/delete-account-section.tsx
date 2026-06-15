"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { deleteAccountAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIRMATION_TEXT = "HESABIMI SİL";

export function DeleteAccountSection() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete =
    password.trim().length > 0 && confirmation.trim() === CONFIRMATION_TEXT;

  async function handleDeleteAccount() {
    if (!canDelete) {
      toast.error(`Onaylamak için "${CONFIRMATION_TEXT}" yazın ve şifrenizi girin.`);
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteAccountAction({ password });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Hesabınız silindi");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Hesap silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-rose-200 dark:border-rose-900/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
          <CardTitle className="text-rose-700 dark:text-rose-300">
            Hesabı Sil
          </CardTitle>
        </div>
        <CardDescription>
          Bu işlem geri alınamaz. Öğünleriniz, gelişim kayıtlarınız, fotoğraflarınız
          ve profil verileriniz kalıcı olarak silinir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delete-password">Şifreniz</Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Hesabınızı doğrulamak için şifrenizi girin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">
            Onay için <span className="font-semibold">{CONFIRMATION_TEXT}</span> yazın
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={CONFIRMATION_TEXT}
            autoComplete="off"
          />
        </div>

        <Button
          type="button"
          variant="destructive"
          disabled={!canDelete || isDeleting}
          onClick={() => void handleDeleteAccount()}
          className="h-11 w-full rounded-2xl text-sm font-semibold"
        >
          {isDeleting ? "Hesap siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}
        </Button>
      </CardContent>
    </Card>
  );
}
