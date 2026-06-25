"use client";

import { useState } from "react";
import { Calendar, FileText } from "lucide-react";

import { ClientDietListDialog } from "@/components/dietitian/client/client-diet-list-dialog";
import { Button } from "@/components/ui/button";

export function ClientAppointmentSection({
  clientId,
  nextAppointmentDate,
}: {
  clientId: string;
  nextAppointmentDate: string;
}) {
  const [dietListOpen, setDietListOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
            <Calendar className="size-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Sıradaki Randevu
            </p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-100">
              {nextAppointmentDate}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-xl border-slate-200 bg-white px-3 text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200 dark:hover:border-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
          onClick={() => setDietListOpen(true)}
        >
          <FileText data-icon="inline-start" />
          Güncel Diyet Listesi
        </Button>
      </div>

      <ClientDietListDialog
        clientId={clientId}
        open={dietListOpen}
        onOpenChange={setDietListOpen}
      />
    </>
  );
}
