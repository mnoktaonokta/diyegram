"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | undefined;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeToSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }

  return "system";
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const hasMounted = useHasMounted();
  const [theme, setThemeState] = useState<Theme>("system");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light" as const,
  );

  useLayoutEffect(() => {
    if (!hasMounted || hasLoadedPreference) {
      return;
    }

    setThemeState(readStoredTheme());
    setHasLoadedPreference(true);
  }, [hasLoadedPreference, hasMounted]);

  const resolvedTheme = useMemo(() => {
    if (!hasMounted) {
      return undefined;
    }

    return theme === "system" ? systemTheme : theme;
  }, [hasMounted, systemTheme, theme]);

  useLayoutEffect(() => {
    if (!hasMounted || resolvedTheme === undefined) {
      return;
    }

    applyTheme(resolvedTheme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [hasMounted, resolvedTheme, theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setHasLoadedPreference(true);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
