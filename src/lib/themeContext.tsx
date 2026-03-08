"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme | null; // null = using OS preference
  setTheme: (theme: Theme | null) => void;
  effectiveTheme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  setTheme: () => {},
  effectiveTheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(null);
  const [effectiveTheme, setEffectiveTheme] = useState<Theme>("light");

  // On mount, restore persisted preference
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  // Track effective (resolved) theme for icon display
  useEffect(() => {
    const update = () => {
      if (theme) {
        setEffectiveTheme(theme);
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setEffectiveTheme(prefersDark ? "dark" : "light");
      }
    };
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  const setTheme = (next: Theme | null) => {
    setThemeState(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
