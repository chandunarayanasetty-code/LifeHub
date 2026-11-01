"use client";

import * as React from "react";
import { CheckCircle2Icon, KeyRoundIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialFormActionState,
  type FormActionState,
} from "@/lib/form-utils";
import { changePasswordAction } from "@/lib/settings/actions";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, isPending] = React.useActionState<
    FormActionState,
    FormData
  >(changePasswordAction, initialFormActionState);
  const [values, setValues] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fieldErrors = state.fieldErrors ?? {};

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11px] text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) => setField("currentPassword", event.target.value)}
          className="h-9"
          required
          aria-invalid={Boolean(fieldErrors.currentPassword)}
        />
        <FieldError messages={fieldErrors.currentPassword} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(event) => setField("newPassword", event.target.value)}
            className="h-9"
            required
            aria-invalid={Boolean(fieldErrors.newPassword)}
          />
          <FieldError messages={fieldErrors.newPassword} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-new-password">Confirm new password</Label>
          <Input
            id="confirm-new-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => setField("confirmPassword", event.target.value)}
            className="h-9"
            required
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          <FieldError messages={fieldErrors.confirmPassword} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="max-w-[260px] text-[10px] leading-relaxed text-muted-foreground">
          Changing your password signs out every other device. This session stays
          signed in.
        </p>
        <Button type="submit" variant="outline" size="sm" className="h-8 gap-1.5" disabled={isPending}>
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRoundIcon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Saving…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
