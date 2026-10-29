"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { buttonVariants } from "@/components/ui/button";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/tasks/schema";
import {
  TASK_SORTS,
  hasActiveFilters,
  type TaskQuery,
  type TaskSort,
} from "@/lib/tasks/query";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<TaskSort, string> = {
  due: "Due date",
  created: "Newest first",
  priority: "Priority",
  title: "Title A–Z",
};

export function TaskFilters({
  query,
  categories,
}: {
  query: TaskQuery;
  categories: string[];
}) {
  // Re-key the form when the URL changes so uncontrolled inputs (especially
  // the "Reset" navigation) show the current values.
  const formKey = [
    query.q,
    query.status,
    query.priority,
    query.category,
    query.sort,
  ].join("|");

  function submitOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      key={formKey}
      method="get"
      action="/tasks"
      className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1fr)_150px_160px_140px_auto] md:items-center"
    >
      {/* Keep the active status tab when searching or changing a filter. */}
      <input type="hidden" name="status" value={query.status} />

      <div className="relative col-span-2 min-w-0 md:col-span-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder="Search tasks, tags, categories…"
          aria-label="Search tasks"
          maxLength={120}
          className="h-9 pr-9 pl-8"
        />
        <button
          type="submit"
          aria-label="Apply search"
          className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowRightIcon className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <NativeSelect
        name="priority"
        defaultValue={query.priority}
        onChange={submitOnChange}
        aria-label="Filter by priority"
        className="h-9"
      >
        <option value="all">All priorities</option>
        {TASK_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {TASK_PRIORITY_LABELS[priority]}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        name="category"
        defaultValue={query.category}
        onChange={submitOnChange}
        aria-label="Filter by category"
        className="h-9"
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        name="sort"
        defaultValue={query.sort}
        onChange={submitOnChange}
        aria-label="Sort tasks"
        className="h-9"
      >
        {TASK_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </NativeSelect>

      {hasActiveFilters(query) ? (
        <Link
          href="/tasks"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "col-span-2 h-9 justify-center text-muted-foreground md:col-span-1",
          )}
        >
          Reset
        </Link>
      ) : null}
    </form>
  );
}
