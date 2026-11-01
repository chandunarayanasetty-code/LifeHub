"use client";

import * as React from "react";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  initialTaskActionState,
  type TaskActionState,
} from "@/lib/tasks/action-types";
import { deleteTaskAction } from "@/lib/tasks/actions";
import type { Task } from "@/lib/types";

function DeleteForm({
  task,
  onCancel,
  onDeleted,
}: {
  task: Task;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    TaskActionState,
    FormData
  >(deleteTaskAction, initialTaskActionState);

  React.useEffect(() => {
    if (state.status === "success") {
      onDeleted();
    }
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={task.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {task.title}
      </p>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2Icon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Deleting…" : "Delete task"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteTaskButton({ task }: { task: Task }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${task.title}`}
        title="Delete task"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              This removes the task from your account permanently. It cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <DeleteForm
              task={task}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
