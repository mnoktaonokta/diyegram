"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Briefcase, Lock, Moon, Sun, UserRound } from "lucide-react";

import {
  updatePasswordAction,
  updateProfileAction,
} from "@/app/actions/profile";
import { useTheme } from "@/components/providers/theme-provider";
import { useUserProfile } from "@/components/providers/user-profile-provider";
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
import { Switch } from "@/components/ui/switch";
import { ProfileAvatarUpload } from "@/components/settings/profile-avatar-upload";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { formatProfileDisplayName } from "@/lib/profile/mappers";
import type {
  GenderOption,
  PasswordChangeForm,
  UserProfileSettings,
} from "@/lib/types/user-profile";
import type { Role } from "@/types/role";

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
  { value: "other", label: "Diğer" },
];

export function SettingsPage({
  userEmail,
  role,
}: {
  userEmail?: string | null;
  role: Role;
}) {
  const { update } = useSession();
  const { profile, refreshProfile, isLoading } = useUserProfile();
  const { resolvedTheme, setTheme } = useTheme();
  const [editedProfile, setEditedProfile] = useState<UserProfileSettings | null>(
    null,
  );
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditedProfile(null);
    }
  }, [profile]);

  const activeProfile = editedProfile ?? profile;
  const isDarkMode = resolvedTheme === "dark";

  function updateProfileField<K extends keyof UserProfileSettings>(
    key: K,
    value: UserProfileSettings[K],
  ) {
    if (!activeProfile) {
      return;
    }

    setEditedProfile((current) => ({
      ...(current ?? activeProfile),
      [key]: value,
    }));
  }

  function updatePasswordField<K extends keyof PasswordChangeForm>(
    key: K,
    value: PasswordChangeForm[K],
  ) {
    setPasswordForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProfile) {
      return;
    }

    const hasPasswordInput =
      passwordForm.currentPassword ||
      passwordForm.newPassword ||
      passwordForm.confirmPassword;

    if (hasPasswordInput) {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        toast.error("Şifre değiştirmek için tüm alanları doldurun.");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error("Yeni şifre en az 6 karakter olmalıdır.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("Yeni şifreler eşleşmiyor.");
        return;
      }
    }

    setIsSaving(true);

    const profileResult = await updateProfileAction({
      ...activeProfile,
      email: activeProfile.email || userEmail || "",
    });

    if (!profileResult.success) {
      toast.error(profileResult.error);
      setIsSaving(false);
      return;
    }

    if (hasPasswordInput) {
      const passwordResult = await updatePasswordAction({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!passwordResult.success) {
        toast.error(passwordResult.error);
        setIsSaving(false);
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    await update({ name: profileResult.data.displayName });
    refreshProfile();
    setEditedProfile(null);
    toast.success("Bilgiler başarıyla güncellendi");
    setIsSaving(false);
  }

  if (isLoading || !activeProfile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/60 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-zinc-400">
        Ayarlar yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-teal-600 dark:text-teal-400" />
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </div>
          <CardDescription>
            Profil bilgilerinizi görüntüleyin ve güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProfileAvatarUpload
            avatarUrl={activeProfile.avatarUrl}
            displayName={formatProfileDisplayName(activeProfile)}
            role={role}
            gender={activeProfile.gender}
            onAvatarChange={(avatarUrl) =>
              updateProfileField("avatarUrl", avatarUrl)
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad</Label>
              <Input
                id="firstName"
                value={activeProfile.firstName}
                onChange={(event) =>
                  updateProfileField("firstName", event.target.value)
                }
                placeholder="Adınız"
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <Input
                id="lastName"
                value={activeProfile.lastName}
                onChange={(event) =>
                  updateProfileField("lastName", event.target.value)
                }
                placeholder="Soyadınız"
                autoComplete="family-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Yaş</Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                value={activeProfile.age}
                onChange={(event) =>
                  updateProfileField("age", event.target.value)
                }
                placeholder="32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Boy (cm)</Label>
              <Input
                id="height"
                type="number"
                min={50}
                max={250}
                value={activeProfile.height}
                onChange={(event) =>
                  updateProfileField("height", event.target.value)
                }
                placeholder="175"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gender">Cinsiyet</Label>
              <select
                id="gender"
                value={activeProfile.gender}
                onChange={(event) =>
                  updateProfileField(
                    "gender",
                    event.target.value as GenderOption,
                  )
                }
                className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Seçiniz</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {role === "DIETITIAN" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-teal-600 dark:text-teal-400" />
              <CardTitle>Profesyonel Profil</CardTitle>
            </div>
            <CardDescription>
              Danışanların gördüğü sosyal profil bilgilerinizi düzenleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professionalTitle">Unvan</Label>
              <Input
                id="professionalTitle"
                value={activeProfile.professionalTitle}
                onChange={(event) =>
                  updateProfileField("professionalTitle", event.target.value)
                }
                placeholder="Klinik Beslenme Uzmanı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biyografi</Label>
              <textarea
                id="bio"
                value={activeProfile.bio}
                onChange={(event) =>
                  updateProfileField("bio", event.target.value)
                }
                placeholder="Sürdürülebilir beslenme danışmanı. Sağlıklı yaşam yolculuğunuzda yanınızdayım."
                rows={4}
                className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-teal-600 dark:text-teal-400" />
            <CardTitle>Hesap ve Güvenlik</CardTitle>
          </div>
          <CardDescription>
            E-posta adresinizi görüntüleyin ve şifrenizi güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={activeProfile.email || userEmail || ""}
              readOnly
              className="cursor-not-allowed bg-slate-50 dark:bg-slate-800/60"
            />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              E-posta adresi güvenlik nedeniyle salt okunurdur.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
              Şifre Değiştir
            </p>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
                autoComplete="new-password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="size-4 text-teal-600 dark:text-teal-400" />
            ) : (
              <Sun className="size-4 text-teal-600 dark:text-teal-400" />
            )}
            <CardTitle>Tercihler</CardTitle>
          </div>
          <CardDescription>
            Uygulama görünümünü kişiselleştirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                Koyu Tema
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isDarkMode ? "Karanlık mod aktif" : "Aydınlık mod aktif"}
              </p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              aria-label="Koyu tema"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isSaving}
        className="h-11 w-full rounded-2xl text-sm font-semibold"
      >
        {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
      </form>

      <DeleteAccountSection />
    </div>
  );
}
