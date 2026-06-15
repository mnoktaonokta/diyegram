"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-2xl" disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-2xl"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Tema değiştir"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
