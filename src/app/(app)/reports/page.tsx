import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  FlameIcon,
  ListTodoIcon,
  TargetIcon,
  WalletIcon,
} from "lucide-react";

import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { formatCurrency, formatPercent } from "@/lib/format";
import { goalProgress } from "@/lib/goals/schema";
import { buildReportSummary } from "@/lib/reports";
import { getWorkspaceData } from "@/lib/workspace";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reports",
};

export const dynamic = "force-dynamic";

const RANGE_DAYS = 30;

export default async function ReportsPage() {
  const user = await requireUser();
  const now = new Date();
  const data = await getWorkspaceData(user.id);

  const summary = buildReportSummary(data, now, RANGE_DAYS);
  const snapshot = getDashboardSnapshot(data, now);
  const activeGoals = data.goals.filter((goal) => goal.status === "active");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description={`Honest analytics computed from your saved records over the last ${RANGE_DAYS} days. There are no sample figures and no estimates.`}
        actions={
          <Badge variant="outline" className="h-6 gap-1.5 px-2 text-[10px]">
            <BarChart3Icon className="size-3" aria-hidden="true" />
            Last {RANGE_DAYS} days
          </Badge>
        }
      />

      <section aria-label="Report summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tasks completed"
          value={String(summary.tasksCompleted)}
          hint={
            summary.tasksCreated > 0
              ? `${formatPercent(summary.taskCompletionRate)} of tasks created in range`
              : "No tasks created in this range"
          }
          icon={CheckCircle2Icon}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Overdue tasks"
          value={String(summary.tasksOverdue)}
          hint="Still open, past their due date"
          icon={ListTodoIcon}
          iconClassName={
            summary.tasksOverdue > 0
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-primary/10 text-primary"
          }
          valueClassName={
            summary.tasksOverdue > 0 ? "text-rose-600 dark:text-rose-400" : undefined
          }
        />
        <StatCard
          label="Habit consistency"
          value={formatPercent(summary.habitRate)}
          hint={`${summary.habitCheckIns} of ${summary.habitPossible} possible check-ins`}
          icon={FlameIcon}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          progress={summary.habitRate * 100}
        />
        <StatCard
          label="This month's balance"
          value={formatCurrency(summary.monthBalanceCents, user.currency, {
            signDisplay: "always",
          })}
          hint={`${formatCurrency(summary.monthIncomeCents, user.currency)} in · ${formatCurrency(summary.monthExpenseCents, user.currency)} out`}
          icon={WalletIcon}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          valueClassName={
            summary.monthBalanceCents < 0
              ? "text-rose-600 dark:text-rose-400"
              : undefined
          }
        />
      </section>

      <section aria-label="Charts" className="grid gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ProductivityChart data={snapshot.weeklyProductivity} />
        </div>
        <div className="min-w-0">
          <CashflowChart data={snapshot.cashflow} currency={user.currency} />
        </div>
      </section>

      <section aria-label="Habits and goals" className="grid gap-3 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Habit consistency
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {RANGE_DAYS}-day check-in rate per habit
              </p>
            </div>
            <Link
              href="/habits"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Habits
              <ArrowRightIcon className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <CardContent className="p-4">
            {summary.habitRows.length === 0 ? (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                No habits are tracked yet. Add one to start measuring
                consistency.
              </p>
            ) : (
              <ul className="space-y-3.5">
                {summary.habitRows.map((row) => (
                  <li key={row.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[11.5px] font-medium">
                        {row.name}
                      </p>
                      <p className="shrink-0 text-[10.5px] text-muted-foreground tabular-nums">
                        {row.checkIns}/{row.possible} · {formatPercent(row.rate)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.rate >= 0.7
                            ? "bg-emerald-500"
                            : row.rate >= 0.4
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                        style={{ width: `${Math.max(1, Math.round(row.rate * 100))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Goal progress
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {summary.activeGoals} active · {summary.completedGoals} completed
              </p>
            </div>
            <Link
              href="/goals"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Goals
              <ArrowRightIcon className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <CardContent className="p-4">
            {activeGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
                <TargetIcon className="size-4.5 text-muted-foreground" aria-hidden="true" />
                <p className="text-[12px] font-medium">No active goals</p>
                <p className="max-w-[240px] text-[10.5px] leading-relaxed text-muted-foreground">
                  Active goals and their progress toward target appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-baseline justify-between">
                  <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                    Average progress
                  </p>
                  <p className="text-[12px] font-semibold tabular-nums">
                    {formatPercent(summary.averageGoalProgress)}
                  </p>
                </div>
                <ul className="space-y-3">
                  {activeGoals.slice(0, 5).map((goal) => {
                    const progress = goalProgress(goal.current, goal.target);
                    return (
                      <li key={goal.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-[11.5px] font-medium">
                            {goal.title}
                          </p>
                          <p className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {goal.current}/{goal.target} {goal.unit}
                          </p>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(progress > 0 ? 2 : 0, progress * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Spending" className="grid gap-3 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Spending by category
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                This calendar month · {summary.monthTransactionCount} records
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Expenses
              <ArrowRightIcon className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <CardContent className="p-4">
            {summary.categoryTotals.length === 0 ? (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                No expenses recorded this month. Category totals appear as soon
                as you add a transaction.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {summary.categoryTotals.map((entry) => (
                  <li
                    key={entry.category}
                    className="flex items-center justify-between gap-3"
                  >
                    <p className="truncate text-[11.5px]">{entry.category}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {formatPercent(entry.share)}
                      </span>
                      <span className="text-[11.5px] font-medium tabular-nums">
                        {formatCurrency(entry.totalCents, user.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="border-b border-border/70 px-4 py-3.5">
            <h2 className="text-[14px] font-semibold tracking-tight">
              How these numbers are built
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Readable, verifiable definitions
            </p>
          </div>
          <CardContent className="p-4">
            <dl className="space-y-2.5 text-[11px] leading-relaxed">
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 font-medium">Tasks completed</dt>
                <dd className="text-muted-foreground">
                  Tasks whose completion timestamp falls in the last{" "}
                  {RANGE_DAYS} days.
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 font-medium">Habit consistency</dt>
                <dd className="text-muted-foreground">
                  Check-ins divided by habits × {RANGE_DAYS} days. Zero habits
                  gives 0%, never a division error.
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 font-medium">Monthly balance</dt>
                <dd className="text-muted-foreground">
                  Income minus expenses for the current calendar month, in{" "}
                  {user.currency}.
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 font-medium">Goal progress</dt>
                <dd className="text-muted-foreground">
                  Current value divided by target, clamped between 0% and 100%.
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t pt-3 text-[10px] text-muted-foreground">
              {summary.eventsThisMonth} calendar{" "}
              {summary.eventsThisMonth === 1 ? "event" : "events"} this month.
              Reports update automatically after every change — no scheduled job
              or cache to refresh.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
