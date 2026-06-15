import {
  buildCalendarDays,
  daysAgoKey,
  monthsAgoKey,
  parseDateKey,
  todayKey,
} from "@/lib/utils/calendar";
import type { MealComment } from "@/lib/types/meal-comments";
import { createMealComment } from "@/lib/types/meal-comments";

export type MealTypeKey =
  | "BREAKFAST"
  | "LUNCH"
  | "SNACK_1"
  | "DINNER"
  | "SNACK_2";

export const MEAL_TYPE_LABELS: Record<MealTypeKey, string> = {
  BREAKFAST: "SABAH",
  LUNCH: "ÖĞLE",
  SNACK_1: "ARA ÖĞÜN",
  DINNER: "AKŞAM",
  SNACK_2: "SON ARA ÖĞÜN",
};

export const MEAL_FEED_ORDER: MealTypeKey[] = [
  "BREAKFAST",
  "LUNCH",
  "SNACK_1",
  "DINNER",
  "SNACK_2",
];

export type ExerciseCategoryId =
  | "WALK"
  | "RUN"
  | "FITNESS"
  | "PILATES"
  | "CYCLING";

export const EXERCISE_CATEGORIES = [
  { id: "WALK" as const, emoji: "🚶‍♂️", label: "Yürüyüş" },
  { id: "RUN" as const, emoji: "🏃‍♀️", label: "Koşu" },
  { id: "FITNESS" as const, emoji: "🏋️‍♂️", label: "Fitness" },
  { id: "PILATES" as const, emoji: "🧘‍♀️", label: "Pilates" },
  { id: "CYCLING" as const, emoji: "🚴‍♂️", label: "Bisiklet" },
];

export type DailyExerciseEntry = {
  id: string;
  categoryId?: ExerciseCategoryId;
  categoryLabel: string;
  emoji: string;
  detail: string;
};

export type ClientMealPost = {
  id: string;
  date: string;
  mealType: MealTypeKey;
  isCheat: boolean;
  isUserCreated: boolean;
  time: string;
  images: string[];
  note?: string;
  comments: MealComment[];
  /** Diyetisyen geri bildirimi — Prisma MealPost.dietitianFeedback */
  feedback?: import("@/lib/mock/dietitian-data").FeedbackStatus;
};

export type DailyRecord = {
  waterGlasses: number;
  exercises: DailyExerciseEntry[];
  meals: ClientMealPost[];
};

export const MOCK_USER = {
  name: "Mehmet",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
};

export const MOCK_CLIENT_REGISTERED_AT = monthsAgoKey(3);

export type BodyMeasurement = {
  weight: number;
  fatPercentage: number;
};

export type MeasurementSnapshot = {
  start: BodyMeasurement;
  previous: BodyMeasurement;
  current: BodyMeasurement;
  targetWeight: number;
  targetFatPercentage: number;
};

export type ClientMotivationData = MeasurementSnapshot & {
  daysUntilCheckup: number | null;
  nextAppointmentDate: string | null;
};

export const MOCK_CLIENT_MEASUREMENTS: ClientMotivationData = {
  start: { weight: 88, fatPercentage: 28.5 },
  previous: { weight: 83.6, fatPercentage: 25.3 },
  current: { weight: 82.4, fatPercentage: 24.8 },
  targetWeight: 78,
  targetFatPercentage: 22,
  daysUntilCheckup: 12,
  nextAppointmentDate: "15 Haziran 2026",
};

/** @deprecated MOCK_CLIENT_MEASUREMENTS kullanın */
export const MOCK_MOTIVATION = {
  daysUntilCheckup: MOCK_CLIENT_MEASUREMENTS.daysUntilCheckup,
  startWeight: MOCK_CLIENT_MEASUREMENTS.start.weight,
  currentWeight: MOCK_CLIENT_MEASUREMENTS.current.weight,
  targetWeight: MOCK_CLIENT_MEASUREMENTS.targetWeight,
  nextAppointmentDate: MOCK_CLIENT_MEASUREMENTS.nextAppointmentDate,
};

const SEED_MEALS_FOR_TODAY: Omit<ClientMealPost, "id" | "date">[] = [
  {
    mealType: "BREAKFAST",
    isCheat: false,
    isUserCreated: false,
    time: "08:15",
    images: [
      "https://images.unsplash.com/photo-1533089860890-a1c582864a1?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=450&fit=crop",
    ],
    note: "Yulaf, muz ve badem sütü",
    comments: [],
  },
  {
    mealType: "LUNCH",
    isCheat: false,
    isUserCreated: false,
    time: "12:45",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
    ],
    note: "Izgara tavuk salata",
    comments: [
      createMealComment("Protein oranı iyi, devam 👍", "DIETITIAN", "Diyetisyen", {
        minutesAgo: 40,
      }),
      createMealComment(
        "Teşekkürler hocam, aynen devam!",
        "CLIENT",
        MOCK_USER.name,
        { minutesAgo: 25 },
      ),
    ],
  },
  {
    mealType: "SNACK_1",
    isCheat: false,
    isUserCreated: false,
    time: "16:00",
    images: [
      "https://images.unsplash.com/photo-1606312619070-d48cbd4abf09?w=600&h=450&fit=crop",
    ],
    note: "Elma ve 10 badem",
    comments: [],
  },
  {
    mealType: "DINNER",
    isCheat: false,
    isUserCreated: false,
    time: "19:30",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop",
    ],
    note: "Sebzeli sote ve yoğurt",
    comments: [],
  },
];

export const DEFAULT_MEAL_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop";

function emptyDailyRecord(): DailyRecord {
  return {
    waterGlasses: 0,
    exercises: [],
    meals: [],
  };
}

export function buildInitialDailyRecords(): Record<string, DailyRecord> {
  const today = todayKey();
  const records: Record<string, DailyRecord> = {
    [today]: {
      waterGlasses: 3,
      exercises: [
        {
          id: "seed-ex-1",
          categoryId: "WALK",
          categoryLabel: "Yürüyüş",
          emoji: "🚶‍♂️",
          detail: "45 dk",
        },
      ],
      meals: SEED_MEALS_FOR_TODAY.map((meal, index) => ({
        ...meal,
        id: `seed-meal-${index + 1}`,
        date: today,
      })),
    },
    [daysAgoKey(1)]: {
      waterGlasses: 5,
      exercises: [
        {
          id: "seed-ex-2",
          categoryId: "RUN",
          categoryLabel: "Koşu",
          emoji: "🏃‍♀️",
          detail: "30 dk",
        },
      ],
      meals: [
        {
          id: "seed-meal-y-1",
          date: daysAgoKey(1),
          mealType: "BREAKFAST",
          isCheat: false,
          isUserCreated: false,
          time: "08:00",
          images: [DEFAULT_MEAL_PLACEHOLDER_IMAGE],
          note: "Peynir ve tam buğday ekmeği",
          comments: [],
        },
        {
          id: "seed-meal-y-2",
          date: daysAgoKey(1),
          mealType: "LUNCH",
          isCheat: false,
          isUserCreated: false,
          time: "13:00",
          images: [DEFAULT_MEAL_PLACEHOLDER_IMAGE],
          note: "Mercimek çorbası",
          comments: [
            createMealComment(
              "Porsiyonu biraz küçültelim",
              "DIETITIAN",
              "Diyetisyen",
              { minutesAgo: 60 },
            ),
          ],
        },
      ],
    },
    [daysAgoKey(2)]: {
      waterGlasses: 4,
      exercises: [],
      meals: [
        {
          id: "seed-meal-y-3",
          date: daysAgoKey(2),
          mealType: "DINNER",
          isCheat: false,
          isUserCreated: false,
          time: "19:00",
          images: [DEFAULT_MEAL_PLACEHOLDER_IMAGE],
          note: "Izgara balık",
          comments: [],
        },
      ],
    },
    [daysAgoKey(3)]: {
      waterGlasses: 6,
      exercises: [],
      meals: [],
    },
  };

  return records;
}

export function getDatesWithMeals(records: Record<string, DailyRecord>) {
  return new Set(
    Object.entries(records)
      .filter(([, record]) => record.meals.length > 0)
      .map(([date]) => date),
  );
}

export function getCalendarDaysFromRecords(records: Record<string, DailyRecord>) {
  return buildCalendarDays({
    startDate: MOCK_CLIENT_REGISTERED_AT,
    datesWithMeals: getDatesWithMeals(records),
  });
}

export function getDailyRecordForDate(
  records: Record<string, DailyRecord>,
  date: string,
): DailyRecord {
  return records[date] ?? emptyDailyRecord();
}

export function groupMealsByType(meals: ClientMealPost[]) {
  return MEAL_FEED_ORDER.map((mealType) => ({
    mealType,
    label: MEAL_TYPE_LABELS[mealType],
    posts: meals.filter((post) => post.mealType === mealType),
  }));
}

export function formatExerciseSummary(entry: DailyExerciseEntry) {
  if (entry.categoryId) {
    return `${entry.emoji} ${entry.categoryLabel} - ${entry.detail}`;
  }

  return `${entry.emoji} ${entry.detail}`;
}

export function formatCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function getWeightProgress() {
  const { current, targetWeight, start } = MOCK_CLIENT_MEASUREMENTS;
  const total = start.weight - targetWeight;
  const progress = start.weight - current.weight;
  return Math.min(100, Math.max(0, Math.round((progress / total) * 100)));
}

/** @deprecated ClientDayProvider kullanın */
export type MockMealPost = ClientMealPost;

/** @deprecated ClientDayProvider kullanın */
export const MOCK_MEAL_POSTS = SEED_MEALS_FOR_TODAY.map((meal, index) => ({
  ...meal,
  id: String(index + 1),
  date: todayKey(),
}));

/** @deprecated groupMealsByType kullanın */
export function getMealsByType() {
  return groupMealsByType(MOCK_MEAL_POSTS);
}

/** @deprecated getCalendarDaysFromRecords kullanın */
export function getClientCalendarDays() {
  return getCalendarDaysFromRecords(buildInitialDailyRecords());
}

export type ProgressTimeFilter = "week" | "month" | "all";

export type ProgressHistoryPoint = {
  date: string;
  weight: number;
  fatPercentage: number;
};

export type ProgressDailyActivity = {
  date: string;
  steps: number;
  exerciseMinutes: number;
  waterGlasses: number;
};

export type ProgressVisualAssets = {
  dayOneImageUrl: string;
  todayImageUrl: string;
};

export type ProgressAchievementDefinition = {
  id: string;
  title: string;
  emoji: string;
  description: string;
};

function roundMeasurement(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function generateProgressHistory(): ProgressHistoryPoint[] {
  const { start, current } = MOCK_CLIENT_MEASUREMENTS;
  const totalDays = 84;
  const points: ProgressHistoryPoint[] = [];

  for (let dayOffset = totalDays; dayOffset >= 0; dayOffset -= 7) {
    const progress = 1 - dayOffset / totalDays;
    const wave = Math.sin(dayOffset / 10) * 0.35;

    points.push({
      date: daysAgoKey(dayOffset),
      weight: roundMeasurement(
        start.weight - (start.weight - current.weight) * progress + wave,
      ),
      fatPercentage: roundMeasurement(
        start.fatPercentage -
          (start.fatPercentage - current.fatPercentage) * progress +
          wave * 0.15,
      ),
    });
  }

  points[points.length - 1] = {
    date: todayKey(),
    weight: current.weight,
    fatPercentage: current.fatPercentage,
  };

  return points;
}

function generateProgressDailyActivity(): ProgressDailyActivity[] {
  const activity: ProgressDailyActivity[] = [];

  for (let dayOffset = 89; dayOffset >= 0; dayOffset -= 1) {
    const progress = 1 - dayOffset / 89;
    const date = daysAgoKey(dayOffset);
    const weekendBoost = [0, 6].includes(parseDateKey(date).getDay()) ? 800 : 0;

    activity.push({
      date,
      steps: Math.round(4200 + progress * 3800 + weekendBoost + (dayOffset % 5) * 120),
      exerciseMinutes: Math.round(18 + progress * 32 + (dayOffset % 3) * 4),
      waterGlasses:
        dayOffset <= 10
          ? 6 + (dayOffset % 3)
          : Math.max(2, Math.round(4 + progress * 3 + (dayOffset % 4))),
    });
  }

  return activity;
}

export const MOCK_PROGRESS_HISTORY = generateProgressHistory();

export const MOCK_PROGRESS_DAILY_ACTIVITY = generateProgressDailyActivity();

export const MOCK_PROGRESS_VISUALS: ProgressVisualAssets = {
  dayOneImageUrl:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop",
  todayImageUrl:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1000&fit=crop",
};

export const PROGRESS_ACHIEVEMENT_DEFINITIONS: ProgressAchievementDefinition[] = [
  {
    id: "first-3kg",
    title: "İlk 3 Kilo Gitti!",
    emoji: "🥉",
    description: "Başlangıçtan itibaren 3 kg kaybettiğinde açılır.",
  },
  {
    id: "first-5kg",
    title: "5 Kiloluk Dönüm Noktası!",
    emoji: "🎯",
    description: "Toplam 5 kg verdiğinde açılır.",
  },
  {
    id: "one-month",
    title: "1 Ayı Devirdin!",
    emoji: "🏆",
    description: "Yolculuğunun 30. gününde açılır.",
  },
  {
    id: "water-champion",
    title: "Su Canavarı",
    emoji: "💧",
    description: "7 gün üst üste su hedefini tamamladığında açılır.",
  },
  {
    id: "fat-milestone",
    title: "Yağ Oranı -3%",
    emoji: "🔥",
    description: "Başlangıca göre 3 puan yağ kaybettiğinde açılır.",
  },
  {
    id: "consistency",
    title: "7 Gün Aktif",
    emoji: "⚡",
    description: "7 gün üst üste egzersiz kaydı yaptığında açılır.",
  },
];

export function syncProgressHistoryWithClinical(
  history: ProgressHistoryPoint[],
  start: BodyMeasurement,
  current: BodyMeasurement,
): ProgressHistoryPoint[] {
  if (history.length === 0) {
    return history;
  }

  const synced = [...history];
  synced[0] = {
    ...synced[0]!,
    date: synced[0]!.date,
    weight: start.weight,
    fatPercentage: start.fatPercentage,
  };
  synced[synced.length - 1] = {
    ...synced[synced.length - 1]!,
    date: todayKey(),
    weight: current.weight,
    fatPercentage: current.fatPercentage,
  };

  return synced;
}
