import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarClockIcon,
  Clock3Icon,
  TargetIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PreviewNotice } from "@/components/preview-notice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { getMockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
};

const ICONS = {
  deadline: Clock3Icon,
  event: CalendarClockIcon,
  goal: TargetIcon,
} as const;

const ICON_STYLES = {
  deadline: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  event: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  goal: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
} as const;

export default function NotificationsPage() {
  const now = new Date();
  const data = getMockData(now);
  const unread = data.notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="In-app notification centre · Phase 6"
        title="Notifications"
        description="A read-only preview of deadline, event, and goal reminders. Marking as read, mark-all-read, and generated reminders arrive in Phase 6."
        actions={
          <Badge
            variant="outline"
            className="h-6 border-amber-500/25 bg-amber-500/5 px-2 text-[10px] text-amber-700 dark:text-amber-400"
          >
            {unread} unread · preview
          </Badge>
        }
      />

      <PreviewNotice>
        These reminders are generated from preview records. No email or
        background delivery is configured — the interface only demonstrates the
        future in-app notification centre.
      </PreviewNotice>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Recent notifications
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {data.notifications.length} total · {unread} unread
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Read-only preview
          </span>
        </div>

        <CardContent className="p-2">
          <ul className="divide-y divide-border/60">
            {data.notifications.map((notification) => {
              const Icon = ICONS[notification.kind];
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    className="flex items-start gap-3 rounded-lg px-2.5 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
                        ICON_STYLES[notification.kind],
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[12.5px]",
                            notification.read
                              ? "font-medium text-muted-foreground"
                              : "font-semibold",
                          )}
                        >
                          {notification.title}
                        </span>
                        {!notification.read ? (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="mt-1 block text-[10px] text-muted-foreground/80">
                        {formatRelativeTime(notification.createdAt, now)}
                      </span>
                    </span>
                    <ArrowRightIcon
                      className="mt-2 size-3.5 shrink-0 text-muted-foreground/60"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
