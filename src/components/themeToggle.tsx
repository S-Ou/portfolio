import { useTheme } from "@/lib/themeContext";
import { Sun, Moon } from "lucide-react";
import styled from "styled-components";

const ThemeToggleButton = styled.button`
  align-items: center;
  aspect-ratio: 1 / 1;
  border-radius: var(--corner-radius);
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  transition: background-color 150ms ease;
  user-select: none;

  &:hover {
    background-color: var(--super-foreground);
  }
`;

export function ThemeToggle() {
  const { effectiveTheme, theme, setTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  const toggle = () => {
    // If manually set, flip it; if following OS, override to the opposite
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <ThemeToggleButton onClick={toggle} aria-label="Toggle light/dark mode">
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </ThemeToggleButton>
  );
}
