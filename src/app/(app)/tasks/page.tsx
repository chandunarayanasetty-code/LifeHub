import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  ListTodoIcon,
  SearchXIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { NewTaskButton } from "@/components/tasks/new-task-button";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskStatusTabs } from "@/components/tasks/task-status-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { isSameDay, startOfDay } from "@/lib/date";
import { getTaskCategories, listTasks } from "@/lib/tasks/repository";
import {
  buildTasksHref,
  countTasks,
  hasActiveFilters,
  matchesTaskFilters,
  matchesTaskStatus,
  parseTaskQuery,
  sortTasks,
  type TaskSort,
} from "@/lib/tasks/query";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Tasks",
};

export const dynamic = "force-dynamic";

const SORT_LABELS: Record<TaskSort, string> = {
  due: "due date",
  created: "newest first",
  priority: "priority",
  title: "title",
};

interface TasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const query = parseTaskQuery(params);
  const intent = Array.isArray(params.intent) ? params.intent[0] : params.intent;
  const now = new Date();

  const [tasks, categories] = await Promise.all([
    listTasks(user.id),
    getTaskCategories(user.id),
  ]);

  const matching = tasks.filter((task) => matchesTaskFilters(task, query));
  const counts = countTasks(matching);
  const visibleTasks = sortTasks(
    matching.filter((task) => matchesTaskStatus(task, query)),
    query.sort,
  );

  const openCount = tasks.filter(
    (task) => task.status === "todo" || task.status === "in-progress",
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const overdueCount = tasks.filter(
    (task) =>
      (task.status === "todo" || task.status === "in-progress") &&
      new Date(task.dueDate) < startOfDay(now),
  ).length;
  const dueTodayCount = tasks.filter(
    (task) =>
      (task.status === "todo" || task.status === "in-progress") &&
      isSameDay(new Date(task.dueDate), now),
  ).length;

  const stats = [
    { label: "Open tasks", value: openCount, icon: ListTodoIcon },
    { label: "Due today", value: dueTodayCount, icon: CalendarClockIcon },
    { label: "Overdue", value: overdueCount, icon: AlertTriangleIcon },
    { label: "Completed", value: completedCount, icon: CheckCircle2Icon },
  ];

  const filtersActive = hasActiveFilters(query);
  const cleanHref = buildTasksHref(query);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Tasks"
        title="My Tasks"
        description="Create, edit, complete, and delete tasks. Changes are stored in your account and appear on the dashboard, reports, and search."
        actions={
          <NewTaskButton
            categories={categories}
            autoOpen={intent === "create"}
            cleanHref={cleanHref}
          />
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-amber-500/35 bg-amber-500/5 px-3.5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        <DatabaseIcon
          className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p>
          {user.isDemo ? (
            <>
              <span className="font-medium text-foreground">Sample workspace.</span>{" "}
              These tasks are sample records, not real user data. They are stored
              in the LifeHub database for the demo account, and you can restore
              the original sample list from Settings.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">Saved in your account.</span>{" "}
              Tasks live in the LifeHub database, scoped to your account, and
              survive restarts and deployments. Only you can see them.
            </>
          )}
        </p>
      </div>

      <section
        aria-label="Task summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="gap-0 py-0">
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-[18px] leading-tight font-semibold tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="gap-0 py-0">
        <CardContent className="p-3">
          <TaskFilters query={query} categories={categories} />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">
              {filtersActive ? "Filtered tasks" : "Your tasks"}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {visibleTasks.length} shown of {tasks.length} · sorted by{" "}
              {SORT_LABELS[query.sort]}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {counts.all} match current filters
          </span>
        </div>

        <div className="border-b border-border/70 px-3 py-2.5">
          <TaskStatusTabs query={query} counts={counts} />
        </div>

        <CardContent className="p-2">
          {visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                {tasks.length === 0 ? (
                  <ListTodoIcon className="size-5" aria-hidden="true" />
                ) : (
                  <SearchXIcon className="size-5" aria-hidden="true" />
                )}
              </span>
              <p className="text-[13px] font-medium">
                {tasks.length === 0 ? "No tasks yet" : "No tasks match"}
              </p>
              <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                {tasks.length === 0
                  ? "Use the New task button above to add your first one. It is saved to your account and appears everywhere in LifeHub."
                  : "Try a different search, priority, category, or status tab."}
              </p>
              {tasks.length === 0 ? null : (
                <Link
                  href="/tasks"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-1 h-8",
                  )}
                >
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  categories={categories}
                  now={now}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
