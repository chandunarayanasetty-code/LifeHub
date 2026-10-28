"use client";

import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: "light" | "dark" | "system";
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-light comfort",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "System",
    description: "Match this device",
    icon: MonitorIcon,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      className="grid gap-2 sm:grid-cols-3"
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = mounted && theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
              active
                ? "border-primary/35 bg-primary/5 ring-1 ring-primary/15"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                active
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-medium">
                {option.label}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {option.description}
              </span>
            </span>
            {active ? (
              <span className="ml-auto text-[9px] font-semibold tracking-wide text-primary uppercase">
                On
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
