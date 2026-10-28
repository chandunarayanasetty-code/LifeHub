import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ListTodoIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PreviewNotice } from "@/components/preview-notice";
import { TaskPriorityDot, TaskStatusBadge } from "@/components/tasks/task-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isSameDay, startOfDay } from "@/lib/date";
import { formatShortDate, formatTime } from "@/lib/format";
import { getMockData } from "@/lib/mock-data";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Tasks",
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  "in-progress": 0,
  todo: 1,
  completed: 2,
  cancelled: 3,
};

interface TasksPageProps {
  searchParams: Promise<{
    intent?: string;
    highlight?: string;
    q?: string;
  }>;
}

async function TasksPreview({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const now = new Date();
  const data = getMockData(now);
  const activeStatuses = new Set(["todo", "in-progress"]);

  const tasks = [...data.tasks].sort((a, b) => {
    const statusDelta = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDelta !== 0) return statusDelta;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const openCount = data.tasks.filter((task) =>
    activeStatuses.has(task.status),
  ).length;
  const completedCount = data.tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const overdueCount = data.tasks.filter(
    (task) =>
      activeStatuses.has(task.status) &&
      new Date(task.dueDate) < startOfDay(now),
  ).length;
  const dueTodayCount = data.tasks.filter(
    (task) =>
      activeStatuses.has(task.status) &&
      isSameDay(new Date(task.dueDate), now),
  ).length;

  const stats = [
    { label: "Open tasks", value: openCount, icon: ListTodoIcon },
    { label: "Due today", value: dueTodayCount, icon: CalendarClockIcon },
    { label: "Overdue", value: overdueCount, icon: AlertTriangleIcon },
    { label: "Completed", value: completedCount, icon: CheckCircle2Icon },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Module preview · Phase 2"
        title="My Tasks"
        description="A read-only look at the task records that will power the task manager. Creating, editing, filtering, and Kanban views arrive in Phase 2."
        actions={
          <Badge
            variant="outline"
            className="h-6 border-amber-500/25 bg-amber-500/5 px-2 text-[10px] text-amber-700 dark:text-amber-400"
          >
            Read-only preview
          </Badge>
        }
      />

      {params.intent === "create" ? (
        <div
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-[12px] leading-relaxed"
        >
          You selected <span className="font-medium">New task</span> from Quick
          add. The task form, server validation, and persistence arrive in Phase
          2. Nothing was saved.
        </div>
      ) : null}

      <PreviewNotice>
        These {data.tasks.length} sample records come from{" "}
        <code className="font-mono text-[10px]">src/lib/mock-data.ts</code>. They
        are not stored in a database and cannot be changed yet. Completed tasks
        remain visible so you can inspect every status.
      </PreviewNotice>

      <section aria-label="Task summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="gap-0 py-0">
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">
              All tasks
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Sorted by status, then due date
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {tasks.length} records
          </span>
        </div>

        <CardContent className="p-2">
          <ul className="divide-y divide-border/60">
            {tasks.map((task) => {
              const highlighted = params.highlight === task.id;
              const overdue =
                activeStatuses.has(task.status) &&
                new Date(task.dueDate) < startOfDay(now);

              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-2.5 py-3",
                    highlighted && "bg-primary/5 ring-1 ring-primary/20",
                    task.status === "cancelled" && "opacity-55",
                  )}
                >
                  <span className="mt-1.5">
                    <TaskPriorityDot priority={task.priority} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p
                        className={cn(
                          "text-[13px] font-medium",
                          task.status === "completed" &&
                            "text-muted-foreground line-through decoration-muted-foreground/40",
                        )}
                      >
                        {task.title}
                      </p>
                      {overdue ? (
                        <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-medium text-rose-700 dark:text-rose-400">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground/70">
                        {task.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatShortDate(task.dueDate)} at{" "}
                        {formatTime(task.dueDate)}
                      </span>
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-1.5 py-0.5 text-[9px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TasksPage(props: TasksPageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      }
    >
      <TasksPreview {...props} />
    </Suspense>
  );
}
