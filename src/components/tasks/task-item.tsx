import { TaskPriorityDot, TaskStatusBadge } from "@/components/tasks/task-badges";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { EditTaskButton } from "@/components/tasks/edit-task-button";
import { TaskToggle } from "@/components/tasks/task-toggle";
import { addDays, isSameDay, startOfDay } from "@/lib/date";
import { formatShortDate, formatTime } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/tasks/schema";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function dueLabel(dueDate: string, now: Date): string {
  const due = new Date(dueDate);

  if (isSameDay(due, now)) return `Today · ${formatTime(due)}`;
  if (isSameDay(due, addDays(startOfDay(now), 1))) {
    return `Tomorrow · ${formatTime(due)}`;
  }
  if (isSameDay(due, addDays(startOfDay(now), -1))) {
    return `Yesterday · ${formatTime(due)}`;
  }

  return `${formatShortDate(due)} · ${formatTime(due)}`;
}

export function TaskItem({
  task,
  categories,
  now,
  highlighted = false,
}: {
  task: Task;
  categories: string[];
  now: Date;
  highlighted?: boolean;
}) {
  const isOpen = task.status === "todo" || task.status === "in-progress";
  const overdue = isOpen && new Date(task.dueDate) < startOfDay(now);
  const done = task.status === "completed" || task.status === "cancelled";

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-lg px-2.5 py-3 transition-colors",
        "hover:bg-muted/35 focus-within:bg-muted/35",
        highlighted && "bg-primary/5 ring-1 ring-primary/20",
        task.status === "cancelled" && "opacity-65",
      )}
    >
      <TaskToggle taskId={task.id} status={task.status} title={task.title} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={cn(
              "text-[13px] font-medium",
              done &&
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

        {task.description ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/70">
            <TaskPriorityDot priority={task.priority} />
            {task.category}
          </span>
          <span aria-hidden="true">·</span>
          <time
            dateTime={task.dueDate}
            className={cn(overdue && "font-medium text-rose-600 dark:text-rose-400")}
          >
            {dueLabel(task.dueDate, now)}
          </time>
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:hidden">
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden sm:inline-flex">
          <TaskStatusBadge status={task.status} />
        </span>
        <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <EditTaskButton task={task} categories={categories} />
          <DeleteTaskButton task={task} />
        </div>
      </div>
    </li>
  );
}
