import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BellIcon,
  BellRingIcon,
  CalendarClockIcon,
  Clock3Icon,
  TargetIcon,
} from "lucide-react";

import {
  MarkAllReadButton,
  MarkReadButton,
} from "@/components/notifications/notification-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/format";
import { listNotifications } from "@/lib/notifications/repository";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
};

export const dynamic = "force-dynamic";

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

interface NotificationsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();
  const filter = params.filter === "unread" ? "unread" : "all";

  const notifications = await listNotifications(user.id);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visible =
    filter === "unread"
      ? notifications.filter((item) => !item.read)
      : notifications;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Reminders"
        title="Notifications"
        description="In-app reminders generated from your own due tasks, upcoming events, and goal deadlines. Nothing is sent by email."
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 gap-1.5 px-2 text-[10px]"
              title="Unread reminders"
            >
              <BellRingIcon className="size-3" aria-hidden="true" />
              {unreadCount} unread
            </Badge>
            <MarkAllReadButton disabled={unreadCount === 0} />
          </div>
        }
      />

      <div className="flex items-center gap-1.5">
        <Link
          href="/notifications"
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
            filter === "all"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          All
        </Link>
        <Link
          href="/notifications?filter=unread"
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
            filter === "unread"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Unread
          {unreadCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] tabular-nums">
              {unreadCount}
            </span>
          ) : null}
        </Link>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <BellIcon className="size-5" aria-hidden="true" />
              </span>
              <p className="text-[14px] font-medium">
                {filter === "unread" ? "Everything is read" : "No reminders yet"}
              </p>
              <p className="max-w-[340px] text-[11.5px] leading-relaxed text-muted-foreground">
                {filter === "unread"
                  ? "You are all caught up. New reminders appear here when a task, event, or goal is close to its date."
                  : "Add a task with a due date, an upcoming event, or a goal deadline and a reminder will appear here automatically."}
              </p>
              {filter === "unread" ? (
                <Link
                  href="/notifications"
                  className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                >
                  View all reminders
                  <ArrowRightIcon className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {visible.map((notification) => {
                const Icon = ICONS[notification.kind];
                return (
                  <li
                    key={notification.id}
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3",
                      !notification.read && "bg-primary/[0.025]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                        ICON_STYLES[notification.kind],
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!notification.read ? (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        ) : null}
                        <p
                          className={cn(
                            "truncate text-[12.5px]",
                            notification.read ? "font-medium" : "font-semibold",
                          )}
                        >
                          {notification.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {notification.description}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(notification.createdAt, now)}
                        </p>
                        <Link
                          href={notification.href}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                        >
                          Open
                          <ArrowRightIcon className="size-2.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>

                    {!notification.read ? (
                      <MarkReadButton
                        id={notification.id}
                        title={notification.title}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Reminders are refreshed when you open the app. They are generated from
        your records only — there is no background email or push delivery, so
        LifeHub never claims to send a message it cannot send.
      </p>
    </div>
  );
}
