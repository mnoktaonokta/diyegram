"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DietitianFeedFilterContextValue = {
  showCheatOnly: boolean;
  setShowCheatOnly: (value: boolean) => void;
  toggleCheatOnly: () => void;
};

const DietitianFeedFilterContext =
  createContext<DietitianFeedFilterContextValue | null>(null);

export function DietitianFeedFilterProvider({ children }: { children: ReactNode }) {
  const [showCheatOnly, setShowCheatOnly] = useState(false);

  const value = useMemo(
    () => ({
      showCheatOnly,
      setShowCheatOnly,
      toggleCheatOnly: () => setShowCheatOnly((current) => !current),
    }),
    [showCheatOnly],
  );

  return (
    <DietitianFeedFilterContext.Provider value={value}>
      {children}
    </DietitianFeedFilterContext.Provider>
  );
}

export function useDietitianFeedFilter() {
  const context = useContext(DietitianFeedFilterContext);
  if (!context) {
    throw new Error(
      "useDietitianFeedFilter must be used within DietitianFeedFilterProvider",
    );
  }
  return context;
}
