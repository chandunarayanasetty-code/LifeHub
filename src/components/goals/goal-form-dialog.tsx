"use client";

import * as React from "react";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { saveGoalAction } from "@/lib/goals/actions";
import {
  GOAL_STATUSES,
  GOAL_STATUS_LABELS,
  initialGoalActionState,
  type GoalActionState,
} from "@/lib/goals/schema";
import { toDateInputValue } from "@/lib/expenses/schema";
import type { Goal, GoalStatus } from "@/lib/types";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  categories: string[];
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

/** Default deadline for a new goal: 30 days from today. */
function defaultGoalDeadline(): string {
  return toDateInputValue(new Date(Date.now() + 30 * 86_400_000));
}

function GoalForm({
  goal,
  categories,
  onCancel,
  onSaved,
}: {
  goal?: Goal;
  categories: string[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    GoalActionState,
    FormData
  >(saveGoalAction, initialGoalActionState);
  const fieldId = React.useId();
  const categoryListId = `${fieldId}-categories`;

  const [values, setValues] = React.useState({
    title: goal?.title ?? "",
    description: goal?.description ?? "",
    category: goal?.category ?? "",
    current: goal ? String(goal.current) : "0",
    target: goal ? String(goal.target) : "",
    unit: goal?.unit ?? "",
    deadline: toDateInputValue(goal?.deadline ?? defaultGoalDeadline()),
    status: (goal?.status ?? "active") as GoalStatus,
  });

  function setField<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  React.useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state.status, onSaved]);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <>
      <DialogHeader>
        <DialogTitle>{goal ? "Edit goal" : "New goal"}</DialogTitle>
        <DialogDescription>
          Progress is stored as whole numbers, so the same goal reads the same
          everywhere. Mark it complete, archive it, or keep it active.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-title`}>Goal</Label>
          <Input
            id={`${fieldId}-title`}
            name="title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="e.g. Read 24 books"
            maxLength={120}
            required
            autoFocus
            className="h-9"
            aria-invalid={Boolean(fieldErrors.title)}
          />
          <FieldError messages={fieldErrors.title} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-description`}>Description</Label>
          <Textarea
            id={`${fieldId}-description`}
            name="description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="Why this matters, and how you will get there."
            maxLength={1000}
            rows={3}
            className="min-h-20"
            aria-invalid={Boolean(fieldErrors.description)}
          />
          <FieldError messages={fieldErrors.description} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-category`}>Category</Label>
            <Input
              id={`${fieldId}-category`}
              name="category"
              value={values.category}
              onChange={(event) => setField("category", event.target.value)}
              placeholder="Health, Learning…"
              list={categoryListId}
              maxLength={40}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.category)}
            />
            <datalist id={categoryListId}>
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FieldError messages={fieldErrors.category} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-deadline`}>Deadline</Label>
            <Input
              id={`${fieldId}-deadline`}
              name="deadline"
              type="date"
              value={values.deadline}
              onChange={(event) => setField("deadline", event.target.value)}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.deadline)}
            />
            <FieldError messages={fieldErrors.deadline} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-current`}>Current</Label>
            <Input
              id={`${fieldId}-current`}
              name="current"
              inputMode="numeric"
              value={values.current}
              onChange={(event) => setField("current", event.target.value)}
              required
              className="h-9 tabular-nums"
              aria-invalid={Boolean(fieldErrors.current)}
            />
            <FieldError messages={fieldErrors.current} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-target`}>Target</Label>
            <Input
              id={`${fieldId}-target`}
              name="target"
              inputMode="numeric"
              value={values.target}
              onChange={(event) => setField("target", event.target.value)}
              placeholder="24"
              required
              className="h-9 tabular-nums"
              aria-invalid={Boolean(fieldErrors.target)}
            />
            <FieldError messages={fieldErrors.target} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-unit`}>Unit</Label>
            <Input
              id={`${fieldId}-unit`}
              name="unit"
              value={values.unit}
              onChange={(event) => setField("unit", event.target.value)}
              placeholder="books, sessions…"
              maxLength={20}
              className="h-9"
              aria-invalid={Boolean(fieldErrors.unit)}
            />
            <FieldError messages={fieldErrors.unit} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-status`}>Status</Label>
          <NativeSelect
            id={`${fieldId}-status`}
            name="status"
            value={values.status}
            onChange={(event) =>
              setField("status", event.target.value as GoalStatus)
            }
            className="h-9"
          >
            {GOAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {GOAL_STATUS_LABELS[status]}
              </option>
            ))}
          </NativeSelect>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-1.5">
            {isPending ? (
              <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {isPending ? "Saving…" : goal ? "Save changes" : "Create goal"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  categories,
}: GoalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {open ? (
          <GoalForm
            goal={goal}
            categories={categories}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
