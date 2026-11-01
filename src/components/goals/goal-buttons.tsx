"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteGoalAction, incrementGoalAction } from "@/lib/goals/actions";
import {
  initialGoalActionState,
  type GoalActionState,
} from "@/lib/goals/schema";
import type { Goal } from "@/lib/types";

const subscribe = () => () => {};

export function NewGoalButton({
  categories,
  autoOpen = false,
}: {
  categories: string[];
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = React.useState(false);

  const dialogOpen = open || (hydrated && autoOpen && !autoOpenDismissed);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAutoOpenDismissed(true);
      if (autoOpen) router.replace("/goals", { scroll: false });
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
        New goal
      </Button>

      <GoalFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        categories={categories}
      />
    </>
  );
}

export function EditGoalButton({
  goal,
  categories,
}: {
  goal: Goal;
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
        aria-label={`Edit ${goal.title}`}
        title="Edit goal"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <GoalFormDialog
        open={open}
        onOpenChange={setOpen}
        goal={goal}
        categories={categories}
      />
    </>
  );
}

export function GoalProgressControls({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = React.useTransition();

  function change(amount: number) {
    startTransition(async () => {
      await incrementGoalAction(goal.id, amount);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => change(-1)}
        disabled={isPending || goal.current <= 0}
        aria-label={`Decrease progress for ${goal.title}`}
        title="Remove one"
        className="size-7"
      >
        {isPending ? (
          <LoaderCircleIcon className="size-3 animate-spin" aria-hidden="true" />
        ) : (
          <MinusIcon className="size-3" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => change(1)}
        disabled={isPending}
        aria-label={`Increase progress for ${goal.title}`}
        title="Add one"
        className="size-7"
      >
        <PlusIcon className="size-3" aria-hidden="true" />
      </Button>
    </div>
  );
}

function DeleteForm({
  goal,
  onCancel,
  onDeleted,
}: {
  goal: Goal;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    GoalActionState,
    FormData
  >(deleteGoalAction, initialGoalActionState);

  React.useEffect(() => {
    if (state.status === "success") onDeleted();
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={goal.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {goal.title}
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
          {isPending ? "Deleting…" : "Delete goal"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteGoalButton({ goal }: { goal: Goal }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${goal.title}`}
        title="Delete goal"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>
              This removes the goal and its recorded progress. It cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteForm
              goal={goal}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
