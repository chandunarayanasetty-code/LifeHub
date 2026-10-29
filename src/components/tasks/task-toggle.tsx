"use client";

import * as React from "react";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

import { setTaskStatusAction } from "@/lib/tasks/actions";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskToggle({
  taskId,
  status,
  title,
}: {
  taskId: string;
  status: TaskStatus;
  title: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const completed = status === "completed";

  function toggle() {
    startTransition(async () => {
      await setTaskStatusAction(taskId, completed ? "todo" : "completed");
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={completed}
      aria-label={
        completed ? `Mark “${title}” as not done` : `Mark “${title}” as done`
      }
      title={completed ? "Mark as not done" : "Mark as done"}
      className={cn(
        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait",
        completed
          ? "border-emerald-500 bg-emerald-500 text-white hover:border-emerald-600 hover:bg-emerald-600"
          : "border-border bg-transparent text-transparent hover:border-emerald-500/70 hover:text-emerald-500/60",
        isPending && "opacity-50",
      )}
    >
      {isPending ? (
        <LoaderCircleIcon className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <CheckIcon
          className={cn("size-3", !completed && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")}
          strokeWidth={3}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
