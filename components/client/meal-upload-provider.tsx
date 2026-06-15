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

type MealUploadContextValue = {
  isOpen: boolean;
  presetIsCheat: boolean;
  openSessionId: number;
  openMealUpload: (options?: { presetIsCheat?: boolean }) => void;
  closeMealUpload: () => void;
};

const MealUploadContext = createContext<MealUploadContextValue | null>(null);

export function MealUploadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetIsCheat, setPresetIsCheat] = useState(false);
  const [openSessionId, setOpenSessionId] = useState(0);

  const openMealUpload = useCallback((options?: { presetIsCheat?: boolean }) => {
    setPresetIsCheat(options?.presetIsCheat ?? false);
    setOpenSessionId((id) => id + 1);
    setIsOpen(true);
  }, []);

  const closeMealUpload = useCallback(() => {
    setIsOpen(false);
    setPresetIsCheat(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      presetIsCheat,
      openSessionId,
      openMealUpload,
      closeMealUpload,
    }),
    [closeMealUpload, isOpen, openMealUpload, openSessionId, presetIsCheat],
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
