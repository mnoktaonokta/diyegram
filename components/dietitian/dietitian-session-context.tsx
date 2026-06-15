"use client";

import { createContext, useContext } from "react";

const DietitianSessionContext = createContext<{ userId: string } | null>(null);

export function DietitianSessionProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  return (
    <DietitianSessionContext.Provider value={{ userId }}>
      {children}
    </DietitianSessionContext.Provider>
  );
}

export function useDietitianSession() {
  return useContext(DietitianSessionContext);
}
