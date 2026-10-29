"use client";

import * as React from "react";
import { PencilIcon } from "lucide-react";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

export function EditTaskButton({
  task,
  categories,
}: {
  task: Task;
  categories: string[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${task.title}`}
        title="Edit task"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        task={task}
      />
    </>
  );
}
