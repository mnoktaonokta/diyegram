import { DailySummaryBanner } from "@/components/client/home/daily-summary-banner";
import { ExerciseModal } from "@/components/client/home/exercise-modal";
import { MealFeed } from "@/components/client/home/meal-feed";
import { MotivationCard } from "@/components/client/home/motivation-card";
import { SpeedDialFab } from "@/components/client/home/speed-dial-fab";
import { WeeklyCalendar } from "@/components/client/home/weekly-calendar";

export function ClientHome() {
  return (
    <>
      <WeeklyCalendar />
      <MotivationCard />
      <DailySummaryBanner />
      <MealFeed />
      <SpeedDialFab />
      <ExerciseModal />
    </>
  );
}
