"use client";

import * as React from "react";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

import { toggleHabitAction } from "@/lib/habits/actions";
import { cn } from "@/lib/utils";

export interface HabitDay {
  key: string;
  /** Short weekday label, e.g. "Mon". */
  weekday: string;
  dayOfMonth: number;
  isToday: boolean;
  isFuture: boolean;
  completed: boolean;
}

const ACCENT_COMPLETE: Record<string, string> = {
  violet: "border-violet-500 bg-violet-500 text-white",
  emerald: "border-emerald-500 bg-emerald-500 text-white",
  amber: "border-amber-500 bg-amber-500 text-white",
  sky: "border-sky-500 bg-sky-500 text-white",
  rose: "border-rose-500 bg-rose-500 text-white",
};

export function HabitCheckGrid({
  habitId,
  habitName,
  color,
  days,
}: {
  habitId: string;
  habitName: string;
  color: string;
  days: HabitDay[];
}) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  function toggle(day: HabitDay) {
    if (day.isFuture || isPending) return;
    setPendingKey(day.key);
    startTransition(async () => {
      await toggleHabitAction(habitId, day.key);
      setPendingKey(null);
    });
  }

  return (
    <div className="grid grid-cols-7 gap-1" role="group" aria-label={`Check-ins for ${habitName}`}>
      {days.map((day) => (
        <button
          key={day.key}
          type="button"
          onClick={() => toggle(day)}
          disabled={day.isFuture || isPending}
          aria-pressed={day.completed}
          aria-label={`${day.isToday ? "Today" : day.weekday} ${day.dayOfMonth}${
            day.completed ? ", completed" : ", not completed"
          }`}
          title={
            day.isFuture
              ? "Future days cannot be checked off"
              : day.completed
                ? "Remove check-in"
                : "Mark as done"
          }
          className={cn(
            "flex h-10 flex-col items-center justify-center gap-0.5 rounded-lg border text-[9px] font-medium transition-colors outline-none",
            "focus-visible:ring-3 focus-visible:ring-ring/50",
            day.completed
              ? ACCENT_COMPLETE[color] ?? ACCENT_COMPLETE.emerald
              : "border-border bg-card text-muted-foreground hover:bg-muted",
            day.isToday && !day.completed && "border-primary/50 bg-primary/5 text-primary",
            day.isFuture && "cursor-not-allowed border-dashed opacity-45 hover:bg-card",
          )}
        >
          <span className="uppercase tracking-wide opacity-80">{day.weekday}</span>
          {pendingKey === day.key ? (
            <LoaderCircleIcon className="size-3 animate-spin" aria-hidden="true" />
          ) : day.completed ? (
            <CheckIcon className="size-3" strokeWidth={3} aria-hidden="true" />
          ) : (
            <span className="text-[10px] tabular-nums">{day.dayOfMonth}</span>
          )}
        </button>
      ))}
    </div>
  );
}
