import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { TaskPriorityDot, TaskStatusBadge } from "@/components/tasks/task-badges";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/format";
import type { Task } from "@/lib/types";

export function TodayTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Today&apos;s tasks
            </h2>
            <span className="grid min-w-5 place-items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
              {tasks.length}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Due before the day ends
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <CardContent className="p-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="text-[13px] font-medium">Nothing due today</p>
            <p className="max-w-[240px] text-[11px] text-muted-foreground">
              Your day is clear. Add a task to keep momentum going.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5"
              >
                <TaskPriorityDot priority={task.priority} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {task.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {task.category} · due {formatTime(task.dueDate)}
                  </p>
                </div>
                <TaskStatusBadge status={task.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
