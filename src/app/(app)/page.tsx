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

import { DataOwnershipCard } from "@/components/dashboard/data-ownership-card";
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
import { buildActivityFeed } from "@/lib/activity";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { startOfDay } from "@/lib/date";
import {
  formatCurrency,
  formatLongDate,
  formatPercent,
  getGreeting,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { getWorkspaceData } from "@/lib/workspace";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const data = await getWorkspaceData(user.id);
  const snapshot = getDashboardSnapshot(data, now);
  const activity = buildActivityFeed(data);
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

  const isEmptyWorkspace =
    data.tasks.length === 0 &&
    data.events.length === 0 &&
    data.transactions.length === 0 &&
    data.habits.length === 0 &&
    data.notes.length === 0 &&
    data.goals.length === 0;

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
              className={cn(
                "h-5 gap-1.5 px-1.5 text-[9px] font-medium",
                user.isDemo
                  ? "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                  : "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
              )}
              title={
                user.isDemo
                  ? "Every record in this workspace is generated sample data."
                  : "Every figure here comes from records you created."
              }
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  user.isDemo ? "bg-amber-500" : "bg-emerald-500",
                )}
                aria-hidden="true"
              />
              {user.isDemo ? "Sample workspace" : "Live data"}
            </Badge>
          </div>

          <h1 className="mt-2 font-display text-[34px] leading-[1.08] tracking-tight text-balance sm:text-[42px]">
            {greeting},{" "}
            <span className="text-primary">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            {isEmptyWorkspace
              ? "Your workspace is ready and completely empty. Add your first task, expense, habit, note, or event — everything you save appears here."
              : "Here is what needs your attention today — a calm view of your tasks, money, habits, and goals."}
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
          value={formatCurrency(snapshot.monthlySavingsCents, user.currency, {
            compact: true,
          })}
          hint={`Income ${formatCurrency(snapshot.monthlyIncomeCents, user.currency, { compact: true })} · Expenses ${formatCurrency(snapshot.monthlyExpenseCents, user.currency, { compact: true })}`}
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
          <CashflowChart data={snapshot.cashflow} currency={user.currency} />
        </div>
        <div className="min-w-0">
          <GoalsCard goals={snapshot.activeGoals} now={now} />
        </div>
      </section>

      <section aria-label="Activity and data ownership" className="grid gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentActivity items={activity} now={now} />
        </div>
        <div className="min-w-0">
          <DataOwnershipCard isDemo={user.isDemo} />
        </div>
      </section>

      <footer className="pt-1 text-center text-[10px] text-muted-foreground">
        LifeHub · One place for everything that matters.{" "}
        {user.isDemo
          ? "This demo workspace contains clearly labelled sample data."
          : "All figures come from records saved in your account."}
      </footer>
    </div>
  );
}
