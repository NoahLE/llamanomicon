import { Button } from "@heroui/react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeButton() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <Button
        onClick={toggle}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        className="shadow-md/30"
      >
        Switch Theme
      </Button>

      <p className="text-xs ml-4 mt-1">
        Current: {theme.slice(0, 1).toUpperCase() + theme.slice(1)}
      </p>
    </>
  );
}
