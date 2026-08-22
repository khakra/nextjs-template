"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

// Cycles light → dark → system. A dropdown for three mutually exclusive options
// meant shipping the Radix menu runtime to every page with a footer.
const ORDER = ["light", "dark", "system"] as const;
type ThemeName = (typeof ORDER)[number];

const LABELS: Record<ThemeName, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // theme is undefined until after hydration; render a stable placeholder so
  // the server and client markup match.
  useEffect(() => setMounted(true), []);

  const current: ThemeName =
    mounted && ORDER.includes(theme as ThemeName)
      ? (theme as ThemeName)
      : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <Button
      aria-label={`Theme: ${LABELS[current]}. Switch to ${LABELS[next]}`}
      onClick={() => setTheme(next)}
      size="icon"
      title={`Theme: ${LABELS[current]}`}
      variant="outline"
    >
      {current === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {current === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      {current === "system" && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
