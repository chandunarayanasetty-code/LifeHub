"use client";

import * as React from "react";
import { CheckCheckIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";

interface MarkAllState {
  status: string;
  message?: string;
}

const initialState: MarkAllState = { status: "idle" };

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [state, formAction, isPending] = React.useActionState<
    MarkAllState,
    FormData
  >(markAllNotificationsReadAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={disabled || isPending}
        className="h-8 gap-1.5 bg-card/60"
      >
        {isPending ? (
          <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCheckIcon className="size-3.5" aria-hidden="true" />
        )}
        {isPending ? "Marking…" : "Mark all read"}
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-[10px] text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function MarkReadButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() =>
        startTransition(async () => {
          await markNotificationReadAction(id);
        })
      }
      disabled={isPending}
      aria-label={`Mark ${title} as read`}
      title="Mark as read"
      className="size-7 text-muted-foreground hover:text-foreground"
    >
      {isPending ? (
        <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <CheckIcon className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}
