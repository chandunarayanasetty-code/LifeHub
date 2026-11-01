"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteHabitAction } from "@/lib/habits/actions";
import {
  initialHabitActionState,
  type HabitActionState,
} from "@/lib/habits/schema";
import type { Habit } from "@/lib/types";

const subscribe = () => () => {};

export function NewHabitButton({ autoOpen = false }: { autoOpen?: boolean }) {
  const router = useRouter();
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = React.useState(false);

  const dialogOpen = open || (hydrated && autoOpen && !autoOpenDismissed);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAutoOpenDismissed(true);
      if (autoOpen) router.replace("/habits", { scroll: false });
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-1.5 px-3 shadow-sm"
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        New habit
      </Button>

      <HabitFormDialog open={dialogOpen} onOpenChange={handleOpenChange} />
    </>
  );
}

export function EditHabitButton({ habit }: { habit: Habit }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${habit.name}`}
        title="Edit habit"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <HabitFormDialog open={open} onOpenChange={setOpen} habit={habit} />
    </>
  );
}

function DeleteForm({
  habit,
  onCancel,
  onDeleted,
}: {
  habit: Habit;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    HabitActionState,
    FormData
  >(deleteHabitAction, initialHabitActionState);

  React.useEffect(() => {
    if (state.status === "success") onDeleted();
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={habit.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {habit.name} · {habit.completions.length} check-ins
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
          {isPending ? "Deleting…" : "Delete habit"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteHabitButton({ habit }: { habit: Habit }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${habit.name}`}
        title="Delete habit"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete habit?</DialogTitle>
            <DialogDescription>
              This removes the habit and all of its check-ins. It cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteForm
              habit={habit}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
