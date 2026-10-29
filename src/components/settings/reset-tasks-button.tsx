"use client";

import * as React from "react";
import { LoaderCircleIcon, RotateCcwIcon } from "lucide-react";

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
import { resetTasksAction } from "@/lib/tasks/actions";

function ResetForm({
  onCancel,
  onReset,
}: {
  onCancel: () => void;
  onReset: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    TaskActionState,
    FormData
  >(resetTasksAction, initialTaskActionState);

  React.useEffect(() => {
    if (state.status === "success") {
      onReset();
    }
  }, [state.status, onReset]);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Any tasks you created, edited, completed, or deleted will be replaced by
        the original sample list. This cannot be undone.
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
            <RotateCcwIcon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Restoring…" : "Restore sample tasks"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ResetTasksButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-3 h-8 gap-1.5"
      >
        <RotateCcwIcon className="size-3.5" aria-hidden="true" />
        Restore sample tasks
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore sample tasks?</DialogTitle>
            <DialogDescription>
              This replaces the contents of the local task file with the
              original Phase 1 sample tasks.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <ResetForm
              onCancel={() => setOpen(false)}
              onReset={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
