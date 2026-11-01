import Link from "next/link";
import {
  CalendarDaysIcon,
  CheckIcon,
  FlameIcon,
  NotebookPenIcon,
  ShieldCheckIcon,
  TargetIcon,
  WalletIcon,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  { icon: CheckIcon, label: "Tasks, calendar events, and reminders" },
  { icon: WalletIcon, label: "Expense tracking with category reports" },
  { icon: FlameIcon, label: "Daily habit check-ins and streaks" },
  { icon: NotebookPenIcon, label: "Notes, goals, and a weekly review" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-border/70 bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 size-72 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative">
          <Brand />
          <p className="mt-14 max-w-md font-display text-[38px] leading-[1.1] tracking-tight text-balance">
            One calm place for everything that matters.
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            LifeHub keeps your tasks, money, habits, notes, and goals together —
            with real database persistence and per-account privacy.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.label}
                  className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-card/80 text-primary ring-1 ring-border/80">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {feature.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-3 backdrop-blur-sm">
            <ShieldCheckIcon
              className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Passwords are hashed with scrypt, sessions are stored server-side,
              and every query is scoped to the signed-in account.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
            <TargetIcon className="size-3.5" aria-hidden="true" />
            <span>Tasks · Calendar · Money · Habits · Notes · Goals</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <p className="px-4 pb-6 text-center text-[10px] text-muted-foreground">
          LifeHub · Built with Next.js, Prisma, and PostgreSQL
        </p>
      </section>
    </div>
  );
}
