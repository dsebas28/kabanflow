"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kanbanflow-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Reads the class the anti-flash inline script (in layout.tsx) already
    // set on <html> before hydration — genuine external DOM state, read once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const setTheme = useCallback((next: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
