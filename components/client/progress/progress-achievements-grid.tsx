import type { ProgressAchievementDefinition } from "@/lib/mock/client-data";
import { cn } from "@/lib/utils";

export type ProgressAchievementState = ProgressAchievementDefinition & {
  unlocked: boolean;
};

export function ProgressAchievementsGrid({
  achievements,
}: {
  achievements: ProgressAchievementState[];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
          Başarılarım
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
          Kilometre taşların ve kazandığın rozetler
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "rounded-2xl border px-3 py-3 transition-colors",
              achievement.unlocked
                ? "border-teal-500/30 bg-teal-500/10 dark:border-teal-500/25 dark:bg-teal-950/30"
                : "border-slate-200/80 bg-slate-50/80 opacity-55 dark:border-slate-800 dark:bg-slate-900/50",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "text-xl",
                  !achievement.unlocked && "grayscale",
                )}
              >
                {achievement.emoji}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold leading-snug",
                    achievement.unlocked
                      ? "text-slate-800 dark:text-zinc-100"
                      : "text-slate-500 dark:text-zinc-500",
                  )}
                >
                  {achievement.title}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-zinc-500">
                  {achievement.unlocked ? "Kazanıldı" : achievement.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
