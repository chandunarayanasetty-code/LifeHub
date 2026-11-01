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
import { saveEventAction } from "@/lib/calendar/actions";
import {
  EVENT_COLORS,
  EVENT_COLOR_LABELS,
  defaultEventTimes,
  initialEventActionState,
  toDateTimeLocalValue,
  type EventActionState,
  type EventFormValues,
} from "@/lib/calendar/schema";
import type { CalendarEvent } from "@/lib/types";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing event. */
  event?: CalendarEvent;
  /** Prefill the start day when creating from a calendar cell (YYYY-MM-DD). */
  defaultDate?: string;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

function EventForm({
  event,
  defaultDate,
  onCancel,
  onSaved,
}: {
  event?: CalendarEvent;
  defaultDate?: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    EventActionState,
    FormData
  >(saveEventAction, initialEventActionState);

  const fieldId = React.useId();
  const fallbackTimes = React.useMemo(() => defaultEventTimes(), []);

  const [values, setValues] = React.useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    start: event
      ? toDateTimeLocalValue(event.start)
      : defaultDate
        ? `${defaultDate}T${fallbackTimes.start.slice(11)}`
        : fallbackTimes.start,
    end: event
      ? toDateTimeLocalValue(event.end)
      : defaultDate
        ? `${defaultDate}T${fallbackTimes.end.slice(11)}`
        : fallbackTimes.end,
    allDay: event?.allDay ?? false,
    location: event?.location ?? "",
    color: event?.color ?? "violet",
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
        <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
        <DialogDescription>
          {event
            ? "Update this event. The change is saved to your account straight away."
            : "Add an event to your calendar. It is stored in your account and appears on the dashboard."}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-title`}>Title</Label>
          <Input
            id={`${fieldId}-title`}
            name="title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="e.g. Dentist appointment"
            maxLength={120}
            required
            autoFocus
            className="h-9"
            aria-invalid={Boolean(fieldErrors.title)}
          />
          <FieldError messages={fieldErrors.title} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-start`}>Starts</Label>
            <Input
              id={`${fieldId}-start`}
              name="start"
              type="datetime-local"
              value={values.start}
              onChange={(event) => setField("start", event.target.value)}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.start)}
            />
            <FieldError messages={fieldErrors.start} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-end`}>Ends</Label>
            <Input
              id={`${fieldId}-end`}
              name="end"
              type="datetime-local"
              value={values.end}
              onChange={(event) => setField("end", event.target.value)}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.end)}
            />
            <FieldError messages={fieldErrors.end} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`${fieldId}-allDay`}
            name="allDay"
            type="checkbox"
            checked={values.allDay}
            onChange={(event) => setField("allDay", event.target.checked)}
            className="size-3.5 rounded border-input accent-primary"
          />
          <Label htmlFor={`${fieldId}-allDay`} className="font-normal">
            All-day event
          </Label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-location`}>Location</Label>
            <Input
              id={`${fieldId}-location`}
              name="location"
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="Optional"
              maxLength={120}
              className="h-9"
              aria-invalid={Boolean(fieldErrors.location)}
            />
            <FieldError messages={fieldErrors.location} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-color`}>Colour</Label>
            <NativeSelect
              id={`${fieldId}-color`}
              name="color"
              value={values.color}
              onChange={(event) =>
                setField("color", event.target.value as EventFormValues["color"])
              }
              className="h-9"
            >
              {EVENT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {EVENT_COLOR_LABELS[color]}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-description`}>Description</Label>
          <Textarea
            id={`${fieldId}-description`}
            name="description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="Agenda, notes, or anything worth remembering."
            maxLength={1000}
            rows={3}
            className="min-h-20"
            aria-invalid={Boolean(fieldErrors.description)}
          />
          <FieldError messages={fieldErrors.description} />
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
            {isPending ? "Saving…" : event ? "Save changes" : "Create event"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
}: EventFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {open ? (
          <EventForm
            event={event}
            defaultDate={defaultDate}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
