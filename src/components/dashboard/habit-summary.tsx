import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  Code2Icon,
  DropletsIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getLastNDays, toDateKey } from "@/lib/date";
import { clampPercent, formatPercent } from "@/lib/format";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

const HABIT_ICONS: Record<Habit["icon"], LucideIcon> = {
  activity: ActivityIcon,
  book: BookOpenIcon,
  droplets: DropletsIcon,
  code: Code2Icon,
  brain: BrainIcon,
};

const ICON_STYLES: Record<Habit["color"], string> = {
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const BAR_STYLES: Record<Habit["color"], string> = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
};

interface HabitSummaryProps {
  habits: Habit[];
  rate: number;
  checkIns: number;
  possible: number;
  now: Date;
}

export function HabitSummary({
  habits,
  rate,
  checkIns,
  possible,
  now,
}: HabitSummaryProps) {
  const weekKeys = new Set(getLastNDays(7, now).map((day) => toDateKey(day)));
  const percent = Math.round(rate * 100);

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Habit consistency
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Last 7 days · {checkIns} of {possible} check-ins
          </p>
        </div>
        <Link
          href="/habits"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All habits
          <ArrowRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="relative grid size-[104px] shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--chart-1) ${percent * 3.6}deg, var(--muted) ${percent * 3.6}deg)`,
            }}
            role="img"
            aria-label={`${percent} percent habit consistency this week`}
          >
            <div className="absolute inset-[9px] grid place-items-center rounded-full bg-card">
              <div className="text-center">
                <p className="text-[20px] leading-none font-semibold tracking-tight tabular-nums">
                  {percent}%
                </p>
                <p className="mt-1 text-[9px] tracking-wide text-muted-foreground uppercase">
                  this week
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {habits.length === 0 ? (
                <>
                  No habits are tracked yet.{" "}
                  <Link
                    href="/habits"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Add your first habit
                  </Link>{" "}
                  to start a streak.
                </>
              ) : (
                <>
                  You are{" "}
                  <span className="font-medium text-foreground">
                    {percent >= 80
                      ? "well above"
                      : percent >= 60
                        ? "above"
                        : "below"}{" "}
                    your 60% target
                  </span>{" "}
                  for the week. Small, repeatable actions compound.
                </>
              )}
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {habits.length} habits tracked · {formatPercent(rate, {
                maximumFractionDigits: 0,
              })}{" "}
              completed
            </p>
          </div>
        </div>

        {habits.length === 0 ? null : (
        <ul className="mt-4 space-y-2.5">
          {habits.map((habit) => {
            const Icon = HABIT_ICONS[habit.icon];
            const count = new Set(
              habit.completions.filter((key) => weekKeys.has(key)),
            ).size;
            const progress = clampPercent(count, 7);

            return (
              <li key={habit.id} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-md",
                    ICON_STYLES[habit.color],
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px] font-medium">
                      {habit.name}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                      {count}/7
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", BAR_STYLES[habit.color])}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}
