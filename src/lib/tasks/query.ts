import type { Task, TaskPriority } from "@/lib/types";

/**
 * URL-driven task filters and sorting.
 *
 * Everything here is pure so the task page can stay a server component and the
 * same parsing rules can later be reused by an API route or tests.
 */

export const TASK_STATUS_FILTERS = [
  "all",
  "active",
  "todo",
  "in-progress",
  "completed",
  "cancelled",
] as const;

export const TASK_SORTS = ["due", "created", "priority", "title"] as const;

export type TaskStatusFilter = (typeof TASK_STATUS_FILTERS)[number];
export type TaskSort = (typeof TASK_SORTS)[number];
export type TaskPriorityFilter = TaskPriority | "all";

export const DEFAULT_TASK_STATUS_FILTER: TaskStatusFilter = "active";
export const DEFAULT_TASK_PRIORITY_FILTER: TaskPriorityFilter = "all";
export const DEFAULT_TASK_CATEGORY_FILTER = "all";
export const DEFAULT_TASK_SORT: TaskSort = "due";

export interface TaskQuery {
  q: string;
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  category: string;
  sort: TaskSort;
}

export interface TaskCounts {
  all: number;
  active: number;
  todo: number;
  "in-progress": number;
  completed: number;
  cancelled: number;
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

function isStatusFilter(value: string): value is TaskStatusFilter {
  return (TASK_STATUS_FILTERS as readonly string[]).includes(value);
}

function isPriorityFilter(value: string): value is TaskPriorityFilter {
  return (
    value === "all" ||
    (["low", "medium", "high", "critical"] as readonly string[]).includes(value)
  );
}

function isSort(value: string): value is TaskSort {
  return (TASK_SORTS as readonly string[]).includes(value);
}

/** Turn raw `searchParams` into a validated filter object. */
export function parseTaskQuery(searchParams: SearchParamsRecord): TaskQuery {
  const statusValue = firstValue(searchParams.status);
  const priorityValue = firstValue(searchParams.priority);
  const sortValue = firstValue(searchParams.sort);
  const categoryValue = firstValue(searchParams.category);

  return {
    q: firstValue(searchParams.q).slice(0, 120),
    status: isStatusFilter(statusValue)
      ? statusValue
      : DEFAULT_TASK_STATUS_FILTER,
    priority: isPriorityFilter(priorityValue)
      ? priorityValue
      : DEFAULT_TASK_PRIORITY_FILTER,
    category: categoryValue || DEFAULT_TASK_CATEGORY_FILTER,
    sort: isSort(sortValue) ? sortValue : DEFAULT_TASK_SORT,
  };
}

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true;

  const haystack = [
    task.title,
    task.description,
    task.category,
    task.status,
    task.priority,
    ...task.tags,
  ]
    .join(" ")
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function matchesStatusFilter(
  task: Task,
  statusFilter: TaskStatusFilter,
): boolean {
  switch (statusFilter) {
    case "active":
      return task.status === "todo" || task.status === "in-progress";
    case "all":
      return true;
    default:
      return task.status === statusFilter;
  }
}

/** Matches search, priority and category. Status is handled separately so the
 * status tabs can show accurate counts. */
export function matchesTaskFilters(task: Task, query: TaskQuery): boolean {
  if (!matchesSearch(task, query.q)) return false;
  if (query.priority !== "all" && task.priority !== query.priority) return false;
  if (query.category !== "all" && task.category !== query.category) {
    return false;
  }
  return true;
}

export function matchesTaskStatus(task: Task, query: TaskQuery): boolean {
  return matchesStatusFilter(task, query.status);
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const sorted = [...tasks];

  switch (sort) {
    case "created":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "priority":
      return sorted.sort((a, b) => {
        const priorityDelta =
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "due":
    default:
      return sorted.sort((a, b) => {
        const dueDelta =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (dueDelta !== 0) return dueDelta;
        return a.title.localeCompare(b.title);
      });
  }
}

export function countTasks(tasks: Task[]): TaskCounts {
  return tasks.reduce<TaskCounts>(
    (counts, task) => {
      counts.all += 1;
      counts[task.status] += 1;
      if (task.status === "todo" || task.status === "in-progress") {
        counts.active += 1;
      }
      return counts;
    },
    {
      all: 0,
      active: 0,
      todo: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    },
  );
}

export function hasActiveFilters(query: TaskQuery): boolean {
  return (
    query.q.length > 0 ||
    query.status !== DEFAULT_TASK_STATUS_FILTER ||
    query.priority !== DEFAULT_TASK_PRIORITY_FILTER ||
    query.category !== DEFAULT_TASK_CATEGORY_FILTER ||
    query.sort !== DEFAULT_TASK_SORT
  );
}

/** Build a `/tasks` URL, leaving out values that equal their defaults. */
export function buildTasksHref(
  query: TaskQuery,
  overrides: Partial<TaskQuery> = {},
): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.status !== DEFAULT_TASK_STATUS_FILTER) {
    params.set("status", merged.status);
  }
  if (merged.priority !== DEFAULT_TASK_PRIORITY_FILTER) {
    params.set("priority", merged.priority);
  }
  if (merged.category !== DEFAULT_TASK_CATEGORY_FILTER) {
    params.set("category", merged.category);
  }
  if (merged.sort !== DEFAULT_TASK_SORT) {
    params.set("sort", merged.sort);
  }

  const search = params.toString();
  return search ? `/tasks?${search}` : "/tasks";
}
