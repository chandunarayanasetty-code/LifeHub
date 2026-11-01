import type { Metadata } from "next";
import Link from "next/link";
import {
  ArchiveIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  PlusIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  DeleteGoalButton,
  EditGoalButton,
  GoalProgressControls,
  NewGoalButton,
} from "@/components/goals/goal-buttons";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { startOfDay } from "@/lib/date";
import { formatPercent, formatShortDate } from "@/lib/format";
import { listGoals } from "@/lib/goals/repository";
import { goalProgress } from "@/lib/goals/schema";
import type { Goal, GoalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Goals",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

function daysUntil(deadline: string, now: Date): number {
  return Math.ceil(
    (startOfDay(new Date(deadline)).getTime() - startOfDay(now).getTime()) /
      86_400_000,
  );
}

function GoalCard({
  goal,
  now,
  categories,
}: {
  goal: Goal;
  now: Date;
  categories: string[];
}) {
  const progress = goalProgress(goal.current, goal.target);
  const remaining = daysUntil(goal.deadline, now);
  const overdue = goal.status === "active" && remaining < 0;
  const dueSoon = goal.status === "active" && remaining >= 0 && remaining <= 14;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="h-5 px-1.5 text-[9px]">
                {goal.category}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-1.5 text-[9px]",
                  goal.status === "active" &&
                    "border-primary/25 bg-primary/5 text-primary",
                  goal.status === "completed" &&
                    "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                )}
              >
                {STATUS_LABELS[goal.status]}
              </Badge>
            </div>
            <h3 className="mt-1.5 text-[13.5px] leading-snug font-semibold">
              {goal.title}
            </h3>
            {goal.description ? (
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {goal.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <EditGoalButton goal={goal} categories={categories} />
            <DeleteGoalButton goal={goal} />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[12px] font-semibold tabular-nums">
              {goal.current}
              <span className="text-[10.5px] font-normal text-muted-foreground">
                {" "}
                / {goal.target} {goal.unit}
              </span>
            </p>
            <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {formatPercent(progress)}
            </p>
          </div>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={`${goal.title} progress`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                goal.status === "completed"
                  ? "bg-emerald-500"
                  : overdue
                    ? "bg-rose-500"
                    : "bg-primary",
              )}
              style={{ width: `${Math.max(progress > 0 ? 2 : 0, progress * 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5">
          <p
            className={cn(
              "inline-flex items-center gap-1 text-[10px]",
              overdue
                ? "text-rose-600 dark:text-rose-400"
                : dueSoon
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground",
            )}
          >
            <CalendarClockIcon className="size-3" aria-hidden="true" />
            {goal.status === "completed"
              ? `Reached by ${formatShortDate(goal.deadline)}`
              : overdue
                ? `${Math.abs(remaining)} days overdue · due ${formatShortDate(goal.deadline)}`
                : remaining === 0
                  ? "Due today"
                  : `Due ${formatShortDate(goal.deadline)} · ${remaining} day${remaining === 1 ? "" : "s"} left`}
          </p>

          {goal.status === "active" ? (
            <GoalProgressControls goal={goal} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalsPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();

  const goals = await listGoals(user.id);
  const categories = [...new Set(goals.map((goal) => goal.category))].sort();

  const active = goals.filter((goal) => goal.status === "active");
  const completed = goals.filter((goal) => goal.status === "completed");
  const archived = goals.filter((goal) => goal.status === "archived");

  const averageProgress =
    active.length > 0
      ? active.reduce(
          (sum, goal) => sum + goalProgress(goal.current, goal.target),
          0,
        ) / active.length
      : 0;
  const dueSoon = active.filter(
    (goal) => daysUntil(goal.deadline, now) >= 0 && daysUntil(goal.deadline, now) <= 14,
  ).length;
  const overdue = active.filter((goal) => daysUntil(goal.deadline, now) < 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Goals"
        title="Goals"
        description="Turn intentions into measurable progress with targets, deadlines, and categories. Every number is stored in your account."
        actions={
          <NewGoalButton categories={categories} autoOpen={params.intent === "create"} />
        }
      />

      <section aria-label="Goal summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active goals"
          value={String(active.length)}
          hint={`${completed.length} completed · ${archived.length} archived`}
          icon={TargetIcon}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Average progress"
          value={formatPercent(averageProgress)}
          hint="Across active goals"
          icon={TrendingUpIcon}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          progress={averageProgress * 100}
        />
        <StatCard
          label="Due in 14 days"
          value={String(dueSoon)}
          hint="Active goals with a near deadline"
          icon={CalendarClockIcon}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Overdue"
          value={String(overdue)}
          hint={overdue > 0 ? "Past the deadline but still active" : "Nothing overdue"}
          icon={CheckCircle2Icon}
          iconClassName={
            overdue > 0
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }
          valueClassName={overdue > 0 ? "text-rose-600 dark:text-rose-400" : undefined}
        />
      </section>

      {goals.length === 0 ? (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <TargetIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[14px] font-medium">No goals yet</p>
            <p className="max-w-[340px] text-[11.5px] leading-relaxed text-muted-foreground">
              A goal is a target plus a deadline. Add one and the progress bar
              here tracks exactly what you record — nothing is estimated.
            </p>
            <Link
              href="/goals?intent=create"
              className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-primary hover:underline"
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
              Create your first goal
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {[
            { title: "Active", goals: active },
            { title: "Completed", goals: completed },
            { title: "Archived", goals: archived },
          ]
            .filter((section) => section.goals.length > 0)
            .map((section) => (
              <section key={section.title} aria-label={section.title}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <Badge variant="outline" className="h-5 px-1.5 text-[9.5px]">
                    {section.goals.length}
                  </Badge>
                  {section.title === "Archived" ? (
                    <ArchiveIcon
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      now={now}
                      categories={categories}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Quick +/− controls change the current value by one and mark a goal
        complete automatically when it reaches its target.
      </p>
    </div>
  );
}
