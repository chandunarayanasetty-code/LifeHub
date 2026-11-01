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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialFormActionState,
  type FormActionState,
} from "@/lib/form-utils";
import { deleteAccountAction } from "@/lib/settings/actions";

function DeleteForm({ onCancel }: { onCancel: () => void }) {
  const [state, formAction, isPending] = React.useActionState<
    FormActionState,
    FormData
  >(deleteAccountAction, initialFormActionState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-3.5">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11px] text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        This permanently deletes your account and every task, event, transaction,
        habit, note, goal, reminder, and session that belongs to it. There is no
        recovery and no backup.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="delete-password">Password</Label>
        <Input
          id="delete-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-9"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password?.length ? (
          <p className="text-[10.5px] font-medium text-destructive">
            {fieldErrors.password.join(" ")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
        <Input
          id="delete-confirmation"
          name="confirmation"
          placeholder="DELETE"
          autoComplete="off"
          required
          className="h-9 font-mono uppercase"
          aria-invalid={Boolean(fieldErrors.confirmation)}
        />
        {fieldErrors.confirmation?.length ? (
          <p className="text-[10.5px] font-medium text-destructive">
            {fieldErrors.confirmation.join(" ")}
          </p>
        ) : null}
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
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2Icon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteAccountDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-3 h-8 gap-1.5"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Confirm with your password. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {open ? <DeleteForm onCancel={() => setOpen(false)} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
