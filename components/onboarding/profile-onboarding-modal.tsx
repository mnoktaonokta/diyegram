"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { completeOnboardingAction } from "@/app/actions/profile";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isProfileOnboardingComplete } from "@/lib/profile/onboarding";
import type { GenderOption } from "@/lib/types/user-profile";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS: { value: Extract<GenderOption, "male" | "female">; label: string }[] =
  [
    { value: "female", label: "Kadın" },
    { value: "male", label: "Erkek" },
  ];

export function ProfileOnboardingModal({
  open,
}: {
  open: boolean;
}) {
  const router = useRouter();
  const { profile, refreshProfile } = useUserProfile();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Extract<GenderOption, "male" | "female">>(
    "female",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAge(profile.age);
    setHeight(profile.height);
    if (profile.gender === "male" || profile.gender === "female") {
      setGender(profile.gender);
    }
  }, [profile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await completeOnboardingAction({
      age,
      height,
      gender,
    });

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    refreshProfile();
    router.refresh();
    toast.success("Profiliniz hazır, hoş geldiniz!");
    setIsSubmitting(false);
  }

  if (!open || !profile || isProfileOnboardingComplete(profile)) {
    return null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[92dvh] w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <h2
                id="onboarding-title"
                className="text-lg font-bold text-slate-800 dark:text-zinc-100"
              >
                Hoş geldiniz 👋
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Devam etmek için yaş, boy ve cinsiyet bilgilerinizi girin.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 overflow-y-auto px-4 py-4 pb-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-age">Yaş</Label>
                  <Input
                    id="onboarding-age"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="120"
                    required
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="28"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-height">Boy (cm)</Label>
                  <Input
                    id="onboarding-height"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="0.1"
                    required
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    placeholder="170"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cinsiyet</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={cn(
                        "rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                        gender === option.value
                          ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-300",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-2xl text-sm font-semibold"
              >
                {isSubmitting ? "Kaydediliyor..." : "Devam Et"}
              </Button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
