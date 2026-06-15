import { Calendar } from "lucide-react";

import { MeasurementMetricsGrid } from "@/components/shared/measurement-metrics-grid";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { ClientProfile } from "@/lib/mock/dietitian-data";
import { getClientPersonalInfoLabel } from "@/lib/utils/resolve-client-profile";

export function ClientProfileHeader({ client }: { client: ClientProfile }) {
  const personalInfoLabel = getClientPersonalInfoLabel(client);

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4 p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/30">
          <UserAvatar
            src={client.avatarUrl}
            alt={client.name}
            size={64}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-800 dark:text-zinc-100">
            {client.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Danışan · {client.joinedAt}
            {personalInfoLabel ? ` · ${personalInfoLabel}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10">
          <Calendar className="size-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Sıradaki Randevu
          </p>
          <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-100">
            {client.nextAppointmentDate}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <MeasurementMetricsGrid
          measurements={client.measurements}
          lastActivity={client.lastActivity}
          showLastActivity
        />
      </div>
    </div>
  );
}
