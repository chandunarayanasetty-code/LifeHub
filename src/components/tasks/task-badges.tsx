import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "border-border bg-muted/50 text-muted-foreground",
  "in-progress":
    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "border-border bg-transparent text-muted-foreground",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_DOT_STYLES: Record<TaskPriority, string> = {
  low: "bg-muted-foreground/50",
  medium: "bg-sky-500",
  high: "bg-amber-500",
  critical: "bg-rose-500",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  critical: "Critical priority",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-5 px-1.5 text-[10px] font-medium", STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function TaskPriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        PRIORITY_DOT_STYLES[priority],
      )}
      title={PRIORITY_LABELS[priority]}
      aria-label={PRIORITY_LABELS[priority]}
      role="img"
    />
  );
}
