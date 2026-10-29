import type { Metadata } from "next";
import {
  BellIcon,
  CoinsIcon,
  Globe2Icon,
  HardDriveIcon,
  LockKeyholeIcon,
  PaletteIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ResetTasksButton } from "@/components/settings/reset-tasks-button";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoUser } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Settings",
};

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

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account & preferences"
        title="Settings"
        description="Theme switching and local task storage work today. Profile edits, account preferences, security, and deletion arrive with authentication and database persistence."
        actions={
          <Badge
            variant="outline"
            className="h-6 border-emerald-500/25 bg-emerald-500/5 px-2 text-[10px] text-emerald-700 dark:text-emerald-400"
          >
            Appearance & tasks are live
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
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
              <Badge
                variant="outline"
                className="h-5 border-emerald-500/25 bg-emerald-500/5 px-1.5 text-[9px] text-emerald-700 dark:text-emerald-400"
              >
                Live
              </Badge>
            </div>
            <CardContent className="p-4">
              <ThemeSelector />
              <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
                Your choice is stored locally by{" "}
                <code className="font-mono text-[10px]">next-themes</code> and
                applied before the page paints. Syncing this preference to your
                account arrives in Phase 6.
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <HardDriveIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Task storage
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Where your tasks are saved in Phase 2
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
            <CardContent className="px-4 py-2">
              <dl>
                <SettingRow
                  label="Storage"
                  value=".data/tasks.json"
                  hint="local JSON file"
                />
                <SettingRow
                  label="Scope"
                  value="Single local user"
                  hint="no account yet"
                />
                <SettingRow
                  label="Database"
                  value="Not connected"
                  hint="Phase 3"
                />
                <SettingRow
                  label="Backups"
                  value="None"
                  hint="file is excluded from git"
                />
              </dl>
              <p className="border-t py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                Tasks survive a server restart, but this file is not a database
                and is not safe for multiple users or multiple app instances. It
                is the honest intermediate step before Prisma and PostgreSQL
                arrive in Phase 3.
              </p>
              <ResetTasksButton />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <UserRoundIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Profile
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Preview account details
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="h-5 px-1.5 text-[9px]">
                Editing · Phase 4
              </Badge>
            </div>
            <CardContent className="px-4 py-2">
              <dl>
                <SettingRow label="Display name" value={demoUser.fullName} />
                <SettingRow label="Email" value={demoUser.email} />
                <SettingRow label="Workspace" value={demoUser.workspace} />
                <SettingRow
                  label="Account status"
                  value="Preview only"
                  hint="no database record"
                />
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Globe2Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    Regional preferences
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Currency, timezone, and date display
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="h-5 px-1.5 text-[9px]">
                Saving · Phase 6
              </Badge>
            </div>
            <CardContent className="px-4 py-2">
              <dl>
                <SettingRow
                  label="Currency"
                  value="US Dollar"
                  hint="USD"
                />
                <SettingRow label="Timezone" value={demoUser.timezone} />
                <SettingRow label="Date format" value="MMM d, yyyy" />
                <SettingRow label="Week starts" value="Monday" />
              </dl>
              <p className="border-t py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                Money is stored as integer minor units (cents) so calculations
                never rely on floating point.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                <BellIcon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Notifications
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Delivery preferences
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-[11.5px] font-medium">In-app reminders</p>
                  <p className="text-[10px] text-muted-foreground">
                    Preview only
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-400">
                  Phase 6
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-[11.5px] font-medium">Email delivery</p>
                  <p className="text-[10px] text-muted-foreground">
                    No provider configured
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                  Off
                </span>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                LifeHub will not claim email delivery works until a scheduled
                job and provider are configured and tested.
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                <ShieldCheckIcon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Security
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Account protection
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-dashed bg-muted/25 px-3 py-2.5">
                <LockKeyholeIcon
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                  Authentication is not connected yet. There is no password or
                  session, and task data lives in one shared local file rather
                  than per-user records. Phase 4 adds registration, login,
                  password recovery, and server-side ownership checks.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <CoinsIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <p className="text-[10px] text-muted-foreground">
                  No real financial data is stored.
                </p>
              </div>
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
                Account deletion becomes available after authentication and
                data persistence are implemented. It will require password
                confirmation and a clear explanation of what is removed.
              </p>
              <Button
                variant="destructive"
                size="sm"
                disabled
                className="mt-3 h-8 gap-1.5"
              >
                <Trash2Icon className="size-3.5" aria-hidden="true" />
                Delete account
                <span className="ml-1 text-[9px] opacity-70">Phase 4</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
