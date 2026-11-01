import type { Metadata } from "next";
import {
  BellIcon,
  DatabaseIcon,
  Globe2Icon,
  LogOutIcon,
  PaletteIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { ProfileForm } from "@/components/settings/profile-form";
import { ResetTasksButton } from "@/components/settings/reset-tasks-button";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { signOutEverywhereAction } from "@/lib/settings/actions";
import { getWorkspaceData } from "@/lib/workspace";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

function SettingRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-[12px] font-medium">
        {value}
        {hint ? (
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const data = await getWorkspaceData(user.id);

  const counts = [
    { label: "Tasks", value: data.tasks.length },
    { label: "Events", value: data.events.length },
    { label: "Transactions", value: data.transactions.length },
    { label: "Habits", value: data.habits.length },
    { label: "Notes", value: data.notes.length },
    { label: "Goals", value: data.goals.length },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account & preferences"
        title="Settings"
        description="Manage your account, password, appearance, and regional preferences. Everything here is stored in your account and scoped to you."
        actions={
          <Badge
            variant="outline"
            className="h-6 gap-1.5 border-emerald-500/25 bg-emerald-500/5 px-2 text-[10px] text-emerald-700 dark:text-emerald-400"
          >
            <ShieldCheckIcon className="size-3" aria-hidden="true" />
            {user.isDemo ? "Demo account" : "Signed in"}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-0 py-0" id="account">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <UserRoundIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Account
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="h-5 border-emerald-500/25 bg-emerald-500/5 px-1.5 text-[9px] text-emerald-700 dark:text-emerald-400"
              >
                Live
              </Badge>
            </div>
            <CardContent className="p-4">
              <ProfileForm
                user={{
                  name: user.name,
                  email: user.email,
                  currency: user.currency,
                  timezone: user.timezone,
                  weekStartsOn: user.weekStartsOn,
                }}
              />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <ShieldCheckIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Security
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Password and sessions
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="h-5 border-emerald-500/25 bg-emerald-500/5 px-1.5 text-[9px] text-emerald-700 dark:text-emerald-400"
              >
                scrypt
              </Badge>
            </div>
            <CardContent className="p-4">
              <ChangePasswordForm />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="max-w-[300px] text-[10px] leading-relaxed text-muted-foreground">
                  Sessions are stored server-side with hashed tokens and expire
                  after 30 days.
                </p>
                <form action={signOutEverywhereAction}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                  >
                    <LogOutIcon className="size-3.5" aria-hidden="true" />
                    Sign out everywhere
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <DatabaseIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Data & storage
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    What belongs to this account
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="h-5 border-emerald-500/25 bg-emerald-500/5 px-1.5 text-[9px] text-emerald-700 dark:text-emerald-400"
              >
                PostgreSQL
              </Badge>
            </div>
            <CardContent className="px-4 py-2">
              <div className="grid grid-cols-3 gap-2 py-2 sm:grid-cols-6">
                {counts.map((count) => (
                  <div
                    key={count.label}
                    className="rounded-lg border bg-muted/25 px-2 py-2 text-center"
                  >
                    <p className="text-[17px] leading-tight font-semibold tabular-nums">
                      {count.value}
                    </p>
                    <p className="text-[9.5px] text-muted-foreground">
                      {count.label}
                    </p>
                  </div>
                ))}
              </div>

              <dl>
                <SettingRow
                  label="Database"
                  value="PostgreSQL via Prisma"
                  hint="driver adapter"
                />
                <SettingRow label="Scope" value="This account only" />
                <SettingRow
                  label="Currency"
                  value={user.currency}
                  hint="stored as integer cents"
                />
                <SettingRow label="Timezone" value={user.timezone} />
              </dl>

              {user.isDemo ? (
                <div className="border-t py-3">
                  <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                    This demo account is seeded with generated sample data. You
                    can restore the original sample task list at any time.
                  </p>
                  <ResetTasksButton />
                </div>
              ) : (
                <p className="border-t py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  Your workspace contains only records you created. Sample data is
                  never mixed into a real account.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <PaletteIcon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Appearance
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Light, dark, or follow your device
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <ThemeSelector />
              <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
                Your theme is stored on this device by{" "}
                <code className="font-mono text-[10px]">next-themes</code> so it
                applies before the page paints. It is intentionally not tied to
                your account.
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Globe2Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Reports & reminders
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  How your data is summarised
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <ul className="space-y-2 text-[11px] leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-2">
                  <BellIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  In-app reminders are generated from your own due tasks, events,
                  and goals.
                </li>
                <li className="flex items-start gap-2">
                  <RotateCcwIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Reports are computed from saved records, not sample figures.
                </li>
                <li className="flex items-start gap-2">
                  <Globe2Icon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Email delivery is not connected. Nothing claims to send email.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="gap-0 border-rose-500/20 py-0">
            <div className="flex items-center gap-2.5 border-b border-rose-500/15 px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Danger zone
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Irreversible account actions
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                Deleting your account removes every record that belongs to it.
                Password confirmation is required, and there is no recovery.
              </p>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
