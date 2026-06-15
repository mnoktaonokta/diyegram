"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Scale } from "lucide-react";
import { toast } from "sonner";

import { updateClinicalMeasurementsAction } from "@/app/actions/progress";
import { ClientDataSkeleton } from "@/components/client/client-data-skeleton";
import { useClientClinicalData } from "@/components/client/clinical/use-client-clinical-data";
import { useClientProgressData } from "@/components/client/progress/use-client-progress-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClinicalUpdateCard() {
  const router = useRouter();
  const { clinical, revision, isLoading, refreshClinical } = useClientClinicalData();
  const { refreshProgress } = useClientProgressData();
  const [weight, setWeight] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!clinical || isLoading) {
      return;
    }

    setWeight(String(clinical.current.weight));
    setFatPercentage(String(clinical.current.fatPercentage));
    setAppointmentDate(clinical.nextAppointmentDate ?? "");
  }, [clinical, isLoading, revision]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedWeight = Number(weight.replace(",", "."));
    const parsedFat = Number(fatPercentage.replace(",", "."));

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error("Geçerli bir kilo değeri girin.");
      return;
    }

    if (!Number.isFinite(parsedFat) || parsedFat <= 0 || parsedFat > 100) {
      toast.error("Geçerli bir yağ oranı girin.");
      return;
    }

    if (!appointmentDate) {
      toast.error("Sonraki randevu tarihini seçin.");
      return;
    }

    setIsSaving(true);

    const result = await updateClinicalMeasurementsAction({
      currentWeight: parsedWeight,
      currentFatPercentage: parsedFat,
      nextAppointmentDate: appointmentDate,
    });

    if (!result.success) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    refreshClinical();
    refreshProgress();
    router.refresh();
    toast.success("Klinik güncellemeniz kaydedildi");
    setIsSaving(false);
  }

  if (isLoading || !clinical) {
    return (
      <section className="mt-8">
        <ClientDataSkeleton className="mt-0" rows={4} />
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
          Klinik Güncellemesi
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
          Klinik sonrası ölçüm ve randevu bilgilerinizi güncelleyin
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center gap-2">
          <Scale className="size-4 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Ölçüm ve Randevu Güncelle
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinical-weight">Güncel Kilo</Label>
            <Input
              id="clinical-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="82.4"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical-fat">Güncel Yağ Oranı</Label>
            <Input
              id="clinical-fat"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="1"
              max="100"
              value={fatPercentage}
              onChange={(event) => setFatPercentage(event.target.value)}
              placeholder="24.8"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical-appointment">Sonraki Randevu Tarihi</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="clinical-appointment"
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="rounded-2xl pl-10"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="mt-5 h-11 w-full rounded-2xl text-sm font-semibold"
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </section>
  );
}
