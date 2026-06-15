"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProgressHistoryPoint } from "@/lib/mock/client-data";
import { formatChartDateLabel } from "@/lib/utils/progress-analytics";

type ChartPoint = ProgressHistoryPoint & {
  label: string;
};

function ProgressChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: ChartPoint;
    dataKey: string;
    value: number;
    color: string;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 px-3 py-2.5 shadow-xl backdrop-blur-md">
      <p className="text-xs font-semibold text-zinc-200">{point.label}</p>
      <div className="mt-2 space-y-1.5">
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="text-sky-300">Kilo</span>
          <span className="font-bold text-white">{point.weight.toFixed(1)} kg</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="text-emerald-300">Yağ Oranı</span>
          <span className="font-bold text-white">
            %{point.fatPercentage.toFixed(1)}
          </span>
        </p>
      </div>
    </div>
  );
}

export function ProgressTrendChart({
  data,
}: {
  data: ProgressHistoryPoint[];
}) {
  const chartData = useMemo(() => {
    const mapped = data.map((point) => ({
      ...point,
      label: formatChartDateLabel(point.date),
    }));

    if (mapped.length === 1) {
      const only = mapped[0]!;
      return [
        only,
        {
          ...only,
          label: "Şimdi",
        },
      ];
    }

    return mapped;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Grafik verisi bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid
            stroke="rgba(148, 163, 184, 0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            yAxisId="weight"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={34}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <YAxis
            yAxisId="fat"
            orientation="right"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={34}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip content={<ProgressChartTooltip />} cursor={{ stroke: "rgba(148,163,184,0.25)" }} />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            stroke="#38bdf8"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8", stroke: "#0f172a", strokeWidth: 2 }}
          />
          <Line
            yAxisId="fat"
            type="monotone"
            dataKey="fatPercentage"
            stroke="#4ade80"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#4ade80", stroke: "#0f172a", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
