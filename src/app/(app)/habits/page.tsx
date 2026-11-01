import type { Metadata } from "next";
import Link from "next/link";
import {
  ActivityIcon,
  BookOpenIcon,
  BrainIcon,
  CalendarCheck2Icon,
  Code2Icon,
  DropletsIcon,
  FlameIcon,
  PlusIcon,
  TrophyIcon,
  type LucideIcon,
} from "lucide-react";

import {
  DeleteHabitButton,
  EditHabitButton,
  NewHabitButton,
} from "@/components/habits/habit-buttons";
import {
  HabitCheckGrid,
  type HabitDay,
} from "@/components/habits/habit-check-grid";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { fromDateKey, isSameDay, toDateKey } from "@/lib/date";
import { formatPercent } from "@/lib/format";
import { listHabits } from "@/lib/habits/repository";
import {
  HABIT_FREQUENCY_LABELS,
  HABIT_ICON_LABELS,
} from "@/lib/habits/schema";
import {
  bestStreak,
  currentStreak,
  lastSevenDays,
  weekSummary,
} from "@/lib/habits/stats";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Habits",
};

export const dynamic = "force-dynamic";

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

interface HabitsPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function HabitsPage({ searchParams }: HabitsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();
  const todayKey = toDateKey(now);

  const habits = await listHabits(user.id);
  const summary = weekSummary(habits, now);
  const dayKeys = lastSevenDays(now);

  const streaks = habits.map((habit) => ({
    habit,
    current: currentStreak(habit, now),
    best: bestStreak(habit),
  }));
  const longestCurrent = streaks.reduce(
    (max, entry) => Math.max(max, entry.current),
    0,
  );
  const checkedToday = habits.filter((habit) =>
    habit.completions.includes(todayKey),
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Habits"
        title="Habits"
        description="Build small routines and see the compounding effect of showing up. One check-in per habit per day, stored in your account."
        actions={<NewHabitButton autoOpen={params.intent === "create"} />}
      />

      <section aria-label="Habit summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Check-ins · last 7 days"
          value={String(summary.checkIns)}
          hint={`${summary.possible} possible check-ins`}
          icon={CalendarCheck2Icon}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Weekly consistency"
          value={formatPercent(summary.rate)}
          hint="Share of the last 7 days completed"
          icon={FlameIcon}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          progress={summary.rate * 100}
        />
        <StatCard
          label="Longest active streak"
          value={`${longestCurrent} ${longestCurrent === 1 ? "day" : "days"}`}
          hint="Consecutive days ending today"
          icon={TrophyIcon}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Done today"
          value={`${checkedToday} / ${habits.length}`}
          hint={
            habits.length === 0
              ? "No habits yet"
              : checkedToday === habits.length
                ? "Everything checked off"
                : "Keep going"
          }
          icon={ActivityIcon}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Your habits
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tap a day to check in or undo. Future days are locked.
          </p>
        </div>
        <Badge variant="outline" className="h-6 px-2 text-[10px]">
          {habits.length} tracked
        </Badge>
      </div>

      {habits.length === 0 ? (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <FlameIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[14px] font-medium">No habits yet</p>
            <p className="max-w-[320px] text-[11.5px] leading-relaxed text-muted-foreground">
              Start with one small, repeatable action. A habit can be daily or a
              weekly target, and every check-in is stored as a real record.
            </p>
            <Link
              href="/habits?intent=create"
              className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-primary hover:underline"
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
              Create your first habit
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {streaks.map(({ habit, current, best }) => {
            const Icon = HABIT_ICONS[habit.icon];
            const days: HabitDay[] = dayKeys.map((key) => ({
              key,
              weekday: new Intl.DateTimeFormat("en-US", {
                weekday: "short",
              }).format(fromDateKey(key)),
              dayOfMonth: fromDateKey(key).getDate(),
              isToday: isSameDay(fromDateKey(key), now),
              isFuture: key > todayKey,
              completed: habit.completions.includes(key),
            }));

            return (
              <Card key={habit.id} className="gap-0 py-0">
                <div className="flex items-start gap-3 border-b border-border/70 px-4 py-3.5">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      ICON_STYLES[habit.color],
                    )}
                  >
                    <Icon className="size-4.5" strokeWidth={1.9} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">
                      {habit.name}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                      {HABIT_ICON_LABELS[habit.icon]} ·{" "}
                      {HABIT_FREQUENCY_LABELS[habit.frequency]}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <EditHabitButton habit={habit} />
                    <DeleteHabitButton habit={habit} />
                  </div>
                </div>

                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="h-5 gap-1 border-amber-500/25 bg-amber-500/5 px-1.5 text-[9.5px] text-amber-700 dark:text-amber-400"
                    >
                      <FlameIcon className="size-3" aria-hidden="true" />
                      {current} day{current === 1 ? "" : "s"} current
                    </Badge>
                    <Badge variant="outline" className="h-5 px-1.5 text-[9.5px]">
                      Best {best}
                    </Badge>
                    <Badge variant="outline" className="h-5 px-1.5 text-[9.5px]">
                      {habit.completions.length} total
                    </Badge>
                  </div>

                  <HabitCheckGrid
                    habitId={habit.id}
                    habitName={habit.name}
                    color={habit.color}
                    days={days}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Streaks use your local calendar days. A streak stays alive until the end
        of today, so it is not marked broken before the day is over.
      </p>
    </div>
  );
}
