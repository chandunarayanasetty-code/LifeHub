"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { EventFormDialog } from "@/components/calendar/event-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteEventAction } from "@/lib/calendar/actions";
import {
  initialEventActionState,
  type EventActionState,
} from "@/lib/calendar/schema";
import type { CalendarEvent } from "@/lib/types";

const subscribe = () => () => {};

export function NewEventButton({
  autoOpen = false,
  cleanHref = "/calendar",
  defaultDate,
}: {
  autoOpen?: boolean;
  cleanHref?: string;
  defaultDate?: string;
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
      if (autoOpen) router.replace(cleanHref, { scroll: false });
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
        New event
      </Button>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        defaultDate={defaultDate}
      />
    </>
  );
}

export function EditEventButton({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${event.title}`}
        title="Edit event"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <EventFormDialog open={open} onOpenChange={setOpen} event={event} />
    </>
  );
}

function DeleteForm({
  event,
  onCancel,
  onDeleted,
}: {
  event: CalendarEvent;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    EventActionState,
    FormData
  >(deleteEventAction, initialEventActionState);

  React.useEffect(() => {
    if (state.status === "success") onDeleted();
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={event.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {event.title}
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
          {isPending ? "Deleting…" : "Delete event"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteEventButton({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${event.title}`}
        title="Delete event"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This removes the event from your calendar. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteForm
              event={event}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
