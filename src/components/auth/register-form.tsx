"use client";

import * as React from "react";
import Link from "next/link";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/lib/auth/action-types";
import { registerAction } from "@/lib/auth/actions";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = React.useActionState(
    registerAction,
    initialAuthActionState,
  );
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const fieldErrors = state.fieldErrors ?? {};

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[30px] leading-tight tracking-tight">
          Create your workspace
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          A private account with its own tasks, events, money, habits, notes,
          and goals. Starts empty — no sample data is mixed in.
        </p>
      </div>

      <form action={formAction} className="space-y-3.5">
        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="register-name">Your name</Label>
          <Input
            id="register-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Alex Morgan"
            maxLength={60}
            required
            className="h-9"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="you@example.com"
            required
            className="h-9"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError messages={fieldErrors.email} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="8+ characters"
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <FieldError messages={fieldErrors.password} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-confirm">Confirm password</Label>
            <Input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) =>
                setField("confirmPassword", event.target.value)
              }
              placeholder="Repeat password"
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            <FieldError messages={fieldErrors.confirmPassword} />
          </div>
        </div>

        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          Passwords are hashed with scrypt before storage. Use at least 8
          characters.
        </p>

        <Button
          type="submit"
          size="lg"
          className="h-9 w-full gap-1.5"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : null}
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[11.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
