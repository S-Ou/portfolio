"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/lib/themeContext";

export function ThemeSyncedToaster() {
  const { effectiveTheme } = useTheme();

  return (
    <Toaster
      theme={effectiveTheme}
      expand={true}
      toastOptions={{
        style: {
          background: "var(--foreground)",
          color: "var(--text-color)",
        },
      }}
    />
  );
}
