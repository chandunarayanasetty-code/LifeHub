"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRoundIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthActionState } from "@/lib/auth/action-types";
import { loginAction } from "@/lib/auth/actions";

interface DemoCredentials {
  email: string;
  password: string;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

export function LoginForm({
  next,
  demoCredentials,
}: {
  next: string;
  demoCredentials: DemoCredentials | null;
}) {
  const [state, formAction, isPending] = React.useActionState(
    loginAction,
    initialAuthActionState,
  );
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const fieldErrors = state.fieldErrors ?? {};

  function fillDemo() {
    if (!demoCredentials) return;
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[30px] leading-tight tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Sign in to your workspace. Your data is private to this account.
        </p>
      </div>

      {demoCredentials ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-start gap-2.5">
            <SparklesIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium">Demo workspace</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                Prefilled sample data — tasks, money, habits, notes, and goals —
                so you can explore every module. Everything is clearly labelled
                as sample data.
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                {demoCredentials.email} · {demoCredentials.password}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemo}
                className="mt-2 h-7 gap-1.5 bg-card text-[11px]"
              >
                <KeyRoundIcon className="size-3" aria-hidden="true" />
                Fill demo details
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="h-9"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError messages={fieldErrors.email} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
            className="h-9"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError messages={fieldErrors.password} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-9 w-full gap-1.5"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : null}
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-[11.5px] text-muted-foreground">
        New to LifeHub?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
