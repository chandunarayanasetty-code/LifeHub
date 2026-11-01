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
import { saveHabitAction } from "@/lib/habits/actions";
import {
  ACCENT_COLORS,
  ACCENT_COLOR_LABELS,
  HABIT_FREQUENCIES,
  HABIT_FREQUENCY_LABELS,
  HABIT_ICONS,
  HABIT_ICON_LABELS,
  initialHabitActionState,
  type HabitActionState,
} from "@/lib/habits/schema";
import type { Habit, HabitFrequency } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

function HabitForm({
  habit,
  onCancel,
  onSaved,
}: {
  habit?: Habit;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    HabitActionState,
    FormData
  >(saveHabitAction, initialHabitActionState);
  const fieldId = React.useId();

  const [values, setValues] = React.useState({
    name: habit?.name ?? "",
    icon: habit?.icon ?? "activity",
    frequency: (habit?.frequency ?? "daily") as HabitFrequency,
    color: habit?.color ?? "emerald",
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
        <DialogTitle>{habit ? "Edit habit" : "New habit"}</DialogTitle>
        <DialogDescription>
          Check-ins are stored as one record per day, so a habit can never be
          counted twice on the same date.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {habit ? <input type="hidden" name="id" value={habit.id} /> : null}

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-name`}>Habit name</Label>
          <Input
            id={`${fieldId}-name`}
            name="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="e.g. Read 20 pages"
            maxLength={60}
            required
            autoFocus
            className="h-9"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-icon`}>Icon</Label>
            <NativeSelect
              id={`${fieldId}-icon`}
              name="icon"
              value={values.icon}
              onChange={(event) =>
                setField("icon", event.target.value as Habit["icon"])
              }
              className="h-9"
            >
              {HABIT_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {HABIT_ICON_LABELS[icon]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-frequency`}>Frequency</Label>
            <NativeSelect
              id={`${fieldId}-frequency`}
              name="frequency"
              value={values.frequency}
              onChange={(event) =>
                setField("frequency", event.target.value as HabitFrequency)
              }
              className="h-9"
            >
              {HABIT_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {HABIT_FREQUENCY_LABELS[frequency]}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-color`}>Colour</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setField("color", color)}
                aria-pressed={values.color === color}
                aria-label={ACCENT_COLOR_LABELS[color]}
                className={cn(
                  "h-7 rounded-full border px-2.5 text-[10.5px] font-medium transition-colors",
                  values.color === color
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {ACCENT_COLOR_LABELS[color]}
              </button>
            ))}
          </div>
          <input type="hidden" name="color" value={values.color} />
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
            {isPending ? "Saving…" : habit ? "Save changes" : "Create habit"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
}: HabitFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        {open ? (
          <HabitForm
            habit={habit}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
