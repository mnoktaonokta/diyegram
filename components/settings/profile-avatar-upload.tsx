"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { compressAvatarImage } from "@/lib/utils/compress-avatar-image";
import type { GenderOption } from "@/lib/types/user-profile";
import type { Role } from "@/types/role";

export function ProfileAvatarUpload({
  avatarUrl,
  displayName,
  role,
  gender,
  onAvatarChange,
}: {
  avatarUrl: string;
  displayName: string;
  role: Role;
  gender?: GenderOption;
  onAvatarChange: (avatarUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const hasCustomAvatar = avatarUrl.startsWith("data:");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      return;
    }

    setIsUploading(true);

    try {
      const compressed = await compressAvatarImage(file);
      onAvatarChange(compressed);
      toast.success("Profil fotoğrafı güncellendi");
    } catch {
      toast.error("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    onAvatarChange("");
    toast.success("Profil fotoğrafı kaldırıldı");
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full ring-4 ring-teal-500/20">
        <UserAvatar
          src={avatarUrl || undefined}
          alt={displayName}
          size={96}
          gender={gender}
        />
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <Label className="text-center sm:text-left">Profil Fotoğrafı</Label>
        <p className="text-center text-xs text-slate-500 sm:text-left dark:text-zinc-400">
          JPG veya PNG yükleyebilirsiniz. Fotoğraf kare olarak kırpılır.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {isUploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
          </Button>
          {hasCustomAvatar ? (
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl text-rose-600 hover:text-rose-700 dark:text-rose-400"
              onClick={handleRemove}
            >
              <Trash2 className="size-4" />
              Kaldır
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
