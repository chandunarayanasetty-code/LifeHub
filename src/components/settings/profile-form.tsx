"use client";

import * as React from "react";
import { CheckCircle2Icon, LoaderCircleIcon, SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  initialFormActionState,
  type FormActionState,
} from "@/lib/form-utils";
import { updateProfileAction } from "@/lib/settings/actions";
import {
  CURRENCIES,
  CURRENCY_LABELS,
  TIMEZONES,
} from "@/lib/settings/schema";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    currency: string;
    timezone: string;
    weekStartsOn: number;
  };
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = React.useActionState<
    FormActionState,
    FormData
  >(updateProfileAction, initialFormActionState);

  const [values, setValues] = React.useState({
    name: user.name,
    currency: CURRENCIES.includes(user.currency as (typeof CURRENCIES)[number])
      ? user.currency
      : "USD",
    timezone: TIMEZONES.includes(user.timezone as (typeof TIMEZONES)[number])
      ? user.timezone
      : "UTC",
    weekStartsOn: String(user.weekStartsOn) === "0" ? "0" : "1",
  });

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-3.5">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            name="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            maxLength={60}
            required
            className="h-9"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          <FieldError messages={fieldErrors.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={user.email}
            readOnly
            disabled
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            Email changes need verification and are not enabled yet.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-currency">Currency</Label>
          <NativeSelect
            id="profile-currency"
            name="currency"
            value={values.currency}
            onChange={(event) => setField("currency", event.target.value)}
            className="h-9"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {CURRENCY_LABELS[currency]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-timezone">Timezone</Label>
          <NativeSelect
            id="profile-timezone"
            name="timezone"
            value={values.timezone}
            onChange={(event) => setField("timezone", event.target.value)}
            className="h-9"
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replaceAll("_", " ")}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-week-start">Week starts on</Label>
        <NativeSelect
          id="profile-week-start"
          name="weekStartsOn"
          value={values.weekStartsOn}
          onChange={(event) => setField("weekStartsOn", event.target.value)}
          className="h-9"
        >
          <option value="1">Monday</option>
          <option value="0">Sunday</option>
        </NativeSelect>
        <p className="text-[10px] text-muted-foreground">
          Saved to your account and used by calendar and report views.
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" size="lg" className="h-8 gap-1.5" disabled={isPending}>
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <SaveIcon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}
