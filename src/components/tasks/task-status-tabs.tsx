import Link from "next/link";

import {
  buildTasksHref,
  type TaskCounts,
  type TaskQuery,
  type TaskStatusFilter,
} from "@/lib/tasks/query";
import { cn } from "@/lib/utils";

const TABS: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TaskStatusTabs({
  query,
  counts,
}: {
  query: TaskQuery;
  counts: TaskCounts;
}) {
  return (
    <nav aria-label="Filter tasks by status" className="flex flex-wrap gap-1">
      {TABS.map((tab) => {
        const active = query.status === tab.value;

        return (
          <Link
            key={tab.value}
            href={buildTasksHref(query, { status: tab.value })}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1 text-[9px] tabular-nums",
                active ? "bg-primary-foreground/20" : "bg-muted",
              )}
            >
              {counts[tab.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
