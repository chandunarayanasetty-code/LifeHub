import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2Icon,
  FlameIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";

import { BuildRoadmap } from "@/components/dashboard/build-roadmap";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { HabitSummary } from "@/components/dashboard/habit-summary";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { startOfDay } from "@/lib/date";
import {
  formatCurrency,
  formatLongDate,
  formatPercent,
  getGreeting,
} from "@/lib/format";
import { demoUser, getMockData } from "@/lib/mock-data";
import { listTasks } from "@/lib/tasks/repository";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  // Tasks are the one module with real mutations, so read them from the task
  // store instead of regenerating the sample list on every request.
  const tasks = await listTasks();
  const data = { ...getMockData(now), tasks };
  const snapshot = getDashboardSnapshot(data, now);
  const greeting = getGreeting(now);

  const activeStatuses = new Set(["todo", "in-progress"]);
  const overdueTasks = data.tasks.filter(
    (task) =>
      activeStatuses.has(task.status) &&
      new Date(task.dueDate) < startOfDay(now),
  ).length;

  const completionDelta =
    snapshot.tasksCompletedLastWeek > 0
      ? Math.round(
          ((snapshot.tasksCompletedThisWeek -
            snapshot.tasksCompletedLastWeek) /
            snapshot.tasksCompletedLastWeek) *
            100,
        )
      : null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {formatLongDate(now)}
            </p>
            <Badge
              variant="outline"
              className="h-5 gap-1.5 border-amber-500/25 bg-amber-500/5 px-1.5 text-[9px] font-medium text-amber-700 dark:text-amber-400"
              title="Tasks are saved locally. Money, habits, goals, events, and notes remain generated sample data."
            >
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              Mixed data
            </Badge>
          </div>

          <h1 className="mt-2 font-display text-[34px] leading-[1.08] tracking-tight text-balance sm:text-[42px]">
            {greeting},{" "}
            <span className="text-primary">{demoUser.name}</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            Here is what needs your attention today — a calm view of your
            tasks, money, habits, and goals. Tasks save locally; the other
            modules still use sample data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:pt-1">
          <Link
            href="/tasks?intent=create"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 gap-1.5 px-3 shadow-sm",
            )}
          >
            <PlusIcon className="size-4" aria-hidden="true" />
            New task
          </Link>
          <Link
            href="/expenses?intent=create"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 gap-1.5 bg-card/60 px-3",
            )}
          >
            <WalletIcon className="size-4" aria-hidden="true" />
            Add expense
          </Link>
          <Link
            href="/notes?intent=create"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 gap-1.5 bg-card/60 px-3",
            )}
          >
            <NotebookPenIcon className="size-4" aria-hidden="true" />
            New note
          </Link>
        </div>
      </header>

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tasks due today"
          value={String(snapshot.tasksDueToday)}
          hint={`${overdueTasks} overdue · ${snapshot.todaysTasks.length} scheduled`}
          icon={ListTodoIcon}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Completed · last 7 days"
          value={String(snapshot.tasksCompletedThisWeek)}
          hint={`${snapshot.tasksCompletedLastWeek} in the previous 7 days`}
          icon={CheckCircle2Icon}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          trend={
            completionDelta === null
              ? undefined
              : {
                  label: `${completionDelta > 0 ? "+" : ""}${completionDelta}%`,
                  tone:
                    completionDelta >= 0
                      ? ("positive" as const)
                      : ("negative" as const),
                }
          }
        />
        <StatCard
          label="Monthly balance"
          value={formatCurrency(snapshot.monthlySavingsCents, "USD", {
            compact: true,
          })}
          hint={`Income ${formatCurrency(snapshot.monthlyIncomeCents, "USD", { compact: true })} · Expenses ${formatCurrency(snapshot.monthlyExpenseCents, "USD", { compact: true })}`}
          icon={WalletIcon}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          valueClassName={
            snapshot.monthlySavingsCents < 0 ? "text-rose-600 dark:text-rose-400" : undefined
          }
        />
        <StatCard
          label="Habit consistency"
          value={formatPercent(snapshot.habitCompletionRate)}
          hint={`${snapshot.habitCheckInsThisWeek} of ${snapshot.habitPossibleCheckIns} check-ins this week`}
          icon={FlameIcon}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          progress={snapshot.habitCompletionRate * 100}
        />
      </section>

      <section aria-label="Productivity and habits" className="grid gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ProductivityChart data={snapshot.weeklyProductivity} />
        </div>
        <div className="min-w-0">
          <HabitSummary
            habits={data.habits}
            rate={snapshot.habitCompletionRate}
            checkIns={snapshot.habitCheckInsThisWeek}
            possible={snapshot.habitPossibleCheckIns}
            now={now}
          />
        </div>
      </section>

      <section aria-label="Today and upcoming" className="grid gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <TodayTasks tasks={snapshot.todaysTasks} />
        </div>
        <div className="min-w-0">
          <UpcomingEvents events={snapshot.upcomingEvents} now={now} />
        </div>
      </section>

      <section aria-label="Money and goals" className="grid gap-3 xl:grid-cols-2">
        <div className="min-w-0">
          <CashflowChart data={snapshot.cashflow} />
        </div>
        <div className="min-w-0">
          <GoalsCard goals={snapshot.activeGoals} now={now} />
        </div>
      </section>

      <section aria-label="Activity and project status" className="grid gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentActivity items={data.activity} now={now} />
        </div>
        <div className="min-w-0">
          <BuildRoadmap />
        </div>
      </section>

      <footer className="pt-1 text-center text-[10px] text-muted-foreground">
        LifeHub · One place for everything that matters. Tasks are saved to a
        local file in this workspace; money, habits, goals, events, and notes
        remain generated sample data.
      </footer>
    </div>
  );
}
