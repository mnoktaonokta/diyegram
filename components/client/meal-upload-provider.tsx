"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MealTypeKey } from "@/lib/mock/client-data";

export type UploadMealType = MealTypeKey;

type MealUploadOpenOptions = {
  presetIsCheat?: boolean;
  presetMealType?: MealTypeKey;
};

type MealUploadContextValue = {
  isOpen: boolean;
  presetIsCheat: boolean;
  presetMealType: MealTypeKey | null;
  openSessionId: number;
  openMealUpload: (options?: MealUploadOpenOptions) => void;
  closeMealUpload: () => void;
};

const MealUploadContext = createContext<MealUploadContextValue | null>(null);

export function MealUploadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetIsCheat, setPresetIsCheat] = useState(false);
  const [presetMealType, setPresetMealType] = useState<MealTypeKey | null>(null);
  const [openSessionId, setOpenSessionId] = useState(0);

  const openMealUpload = useCallback((options?: MealUploadOpenOptions) => {
    setPresetIsCheat(options?.presetIsCheat ?? false);
    setPresetMealType(options?.presetMealType ?? null);
    setOpenSessionId((id) => id + 1);
    setIsOpen(true);
  }, []);

  const closeMealUpload = useCallback(() => {
    setIsOpen(false);
    setPresetIsCheat(false);
    setPresetMealType(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      presetIsCheat,
      presetMealType,
      openSessionId,
      openMealUpload,
      closeMealUpload,
    }),
    [
      closeMealUpload,
      isOpen,
      openMealUpload,
      openSessionId,
      presetIsCheat,
      presetMealType,
    ],
  );

  return (
    <MealUploadContext.Provider value={value}>
      {children}
    </MealUploadContext.Provider>
  );
}

export function useMealUpload() {
  const context = useContext(MealUploadContext);
  if (!context) {
    throw new Error("useMealUpload must be used within MealUploadProvider");
  }
  return context;
}
