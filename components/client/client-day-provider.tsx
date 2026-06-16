"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addDailyExerciseAction,
  decrementWaterGlassAction,
  getActivityDatesAction,
  getDailyActivityForDateAction,
  incrementWaterGlassAction,
  removeDailyExerciseAction,
} from "@/app/actions/activity";
import {
  createMealCommentAction,
  createMealPostAction,
  deleteMealPostAction,
  getClientMealCalendarAction,
  getClientMealsForDateAction,
} from "@/app/actions/meal";
import {
  formatCurrentTime,
  groupMealsByType,
  type ClientMealPost,
  type DailyExerciseEntry,
  type DailyRecord,
} from "@/lib/mock/client-data";
import type { CommentAuthorRole } from "@/lib/types/meal-comments";
import { createMealComment } from "@/lib/types/meal-comments";
import { todayKey, type WeekDay } from "@/lib/utils/calendar";

type AddExerciseInput = Omit<DailyExerciseEntry, "id">;

type AddMealInput = Omit<
  ClientMealPost,
  "id" | "date" | "isUserCreated" | "comments" | "feedback" | "images"
> & {
  imageFiles?: File[];
};

type ClientDayContextValue = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  calendarDays: WeekDay[];
  selectedDailyRecord: DailyRecord;
  mealSections: ReturnType<typeof groupMealsByType>;
  isMealsLoading: boolean;
  isActivityLoading: boolean;
  isExerciseModalOpen: boolean;
  openExerciseModal: () => void;
  closeExerciseModal: () => void;
  exerciseOpenSessionId: number;
  refreshMeals: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  addWaterGlass: (date?: string) => Promise<number>;
  removeWaterGlass: (date?: string) => Promise<void>;
  addExercise: (entry: AddExerciseInput, date?: string) => Promise<void>;
  removeExercise: (exerciseId: string, date?: string) => Promise<void>;
  addMeal: (meal: AddMealInput, date?: string) => Promise<void>;
  removeMeal: (mealId: string, date?: string) => Promise<void>;
  addMealComment: (
    mealId: string,
    text: string,
    authorRole: CommentAuthorRole,
    authorName: string,
    date?: string,
  ) => Promise<void>;
};

const ClientDayContext = createContext<ClientDayContextValue | null>(null);

function resolveTargetDate(date: unknown, fallback: string) {
  return typeof date === "string" ? date : fallback;
}

function mergeCalendarDays(
  mealCalendar: WeekDay[],
  activityDates: Set<string>,
) {
  return mealCalendar.map((day) => ({
    ...day,
    hasMeals: day.hasMeals || activityDates.has(day.date),
  }));
}

const EMPTY_ACTIVITY: Omit<DailyRecord, "meals"> = {
  waterGlasses: 0,
  exercises: [],
};

export function ClientDayProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [selectedDate, setSelectedDateState] = useState(todayKey);
  const [meals, setMeals] = useState<ClientMealPost[]>([]);
  const [activity, setActivity] = useState(EMPTY_ACTIVITY);
  const [mealCalendarDays, setMealCalendarDays] = useState<WeekDay[]>([]);
  const [activityDates, setActivityDates] = useState<Set<string>>(new Set());
  const [isMealsLoading, setIsMealsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseOpenSessionId, setExerciseOpenSessionId] = useState(0);
  const [mealRefreshToken, setMealRefreshToken] = useState(0);
  const [activityRefreshToken, setActivityRefreshToken] = useState(0);

  const refreshMeals = useCallback(async () => {
    setIsMealsLoading(true);

    const [mealsResult, calendarResult] = await Promise.all([
      getClientMealsForDateAction(selectedDate),
      getClientMealCalendarAction(),
    ]);

    if (mealsResult.success) {
      setMeals(mealsResult.data);
    } else {
      toast.error(mealsResult.error);
      setMeals([]);
    }

    if (calendarResult.success) {
      setMealCalendarDays(calendarResult.data);
    }

    setIsMealsLoading(false);
  }, [selectedDate]);

  const refreshActivity = useCallback(async () => {
    setIsActivityLoading(true);

    const [activityResult, datesResult] = await Promise.all([
      getDailyActivityForDateAction(selectedDate),
      getActivityDatesAction(),
    ]);

    if (activityResult.success) {
      setActivity({
        waterGlasses: activityResult.data.waterGlasses,
        exercises: activityResult.data.exercises,
      });
    } else {
      toast.error(activityResult.error);
      setActivity(EMPTY_ACTIVITY);
    }

    if (datesResult.success) {
      setActivityDates(new Set(datesResult.data));
    }

    setIsActivityLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    void refreshMeals();
  }, [mealRefreshToken, refreshMeals]);

  useEffect(() => {
    void refreshActivity();
  }, [activityRefreshToken, refreshActivity]);

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
  }, []);

  const calendarDays = useMemo(
    () => mergeCalendarDays(mealCalendarDays, activityDates),
    [activityDates, mealCalendarDays],
  );

  const selectedDailyRecord = useMemo(
    () => ({
      ...activity,
      meals,
    }),
    [activity, meals],
  );

  const mealSections = useMemo(
    () => groupMealsByType(selectedDailyRecord.meals),
    [selectedDailyRecord.meals],
  );

  const addWaterGlass = useCallback(
    async (date?: unknown) => {
      const targetDate = resolveTargetDate(date, selectedDate);
      const result = await incrementWaterGlassAction(targetDate);

      if (!result.success) {
        toast.error(result.error);
        return 0;
      }

      if (targetDate === selectedDate) {
        setActivity((current) => ({
          ...current,
          waterGlasses: result.data.waterGlasses,
        }));
      }

      setActivityRefreshToken((token) => token + 1);
      return result.data.waterGlasses;
    },
    [selectedDate],
  );

  const removeWaterGlass = useCallback(
    async (date?: unknown) => {
      const targetDate = resolveTargetDate(date, selectedDate);
      const result = await decrementWaterGlassAction(targetDate);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (targetDate === selectedDate) {
        setActivity((current) => ({
          ...current,
          waterGlasses: result.data.waterGlasses,
        }));
      }

      setActivityRefreshToken((token) => token + 1);
    },
    [selectedDate],
  );

  const addExercise = useCallback(
    async (entry: AddExerciseInput, date?: unknown) => {
      const targetDate = resolveTargetDate(date, selectedDate);
      const result = await addDailyExerciseAction({
        dateKey: targetDate,
        categoryId: entry.categoryId,
        categoryLabel: entry.categoryLabel,
        emoji: entry.emoji,
        detail: entry.detail,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setActivityRefreshToken((token) => token + 1);
    },
    [selectedDate],
  );

  const removeExercise = useCallback(
    async (exerciseId: string, date?: unknown) => {
      void date;
      const result = await removeDailyExerciseAction(exerciseId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setActivityRefreshToken((token) => token + 1);
    },
    [],
  );

  const addMeal = useCallback(
    async (meal: AddMealInput, date?: unknown) => {
      const targetDate = resolveTargetDate(date, selectedDate);
      const formData = new FormData();
      formData.append("dateKey", targetDate);
      formData.append("mealType", meal.mealType);
      formData.append("isCheat", String(meal.isCheat));
      formData.append("time", meal.time || formatCurrentTime());

      if (meal.note?.trim()) {
        formData.append("note", meal.note.trim());
      }

      for (const file of meal.imageFiles ?? []) {
        formData.append("images", file);
      }

      const result = await createMealPostAction(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setMealRefreshToken((token) => token + 1);
    },
    [selectedDate],
  );

  const removeMeal = useCallback(async (mealId: string, date?: unknown) => {
    void date;
    const result = await deleteMealPostAction(mealId);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setMealRefreshToken((token) => token + 1);
  }, []);

  const addMealComment = useCallback(
    async (
      mealId: string,
      text: string,
      authorRole: CommentAuthorRole,
      authorName: string,
      date?: unknown,
    ) => {
      void date;

      const result = await createMealCommentAction(mealId, text);

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      const newComment = {
        ...createMealComment(text, authorRole, authorName),
        id: result.data.id,
      };

      setMeals((current) =>
        current.map((meal) =>
          meal.id === mealId
            ? { ...meal, comments: [...meal.comments, newComment] }
            : meal,
        ),
      );
      router.refresh();
    },
    [router],
  );

  const openExerciseModal = useCallback(() => {
    setExerciseOpenSessionId((id) => id + 1);
    setIsExerciseModalOpen(true);
  }, []);

  const closeExerciseModal = useCallback(() => {
    setIsExerciseModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      calendarDays,
      selectedDailyRecord,
      mealSections,
      isMealsLoading,
      isActivityLoading,
      isExerciseModalOpen,
      openExerciseModal,
      closeExerciseModal,
      exerciseOpenSessionId,
      refreshMeals,
      refreshActivity,
      addWaterGlass,
      removeWaterGlass,
      addExercise,
      removeExercise,
      addMeal,
      removeMeal,
      addMealComment,
    }),
    [
      addExercise,
      addMeal,
      addMealComment,
      addWaterGlass,
      calendarDays,
      closeExerciseModal,
      exerciseOpenSessionId,
      isActivityLoading,
      isExerciseModalOpen,
      isMealsLoading,
      mealSections,
      openExerciseModal,
      refreshActivity,
      refreshMeals,
      removeExercise,
      removeMeal,
      removeWaterGlass,
      selectedDailyRecord,
      selectedDate,
      setSelectedDate,
    ],
  );

  return (
    <ClientDayContext.Provider value={value}>
      {children}
    </ClientDayContext.Provider>
  );
}

export function useClientDay() {
  const context = useContext(ClientDayContext);
  if (!context) {
    throw new Error("useClientDay must be used within ClientDayProvider");
  }
  return context;
}
