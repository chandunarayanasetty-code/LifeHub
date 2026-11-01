import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  FlameIcon,
  NotebookPenIcon,
  TargetIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACTIVITY_STYLES: Record<
  ActivityItem["kind"],
  { icon: LucideIcon; className: string }
> = {
  task: {
    icon: CheckCircle2Icon,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  expense: {
    icon: WalletIcon,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  habit: {
    icon: FlameIcon,
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  note: {
    icon: NotebookPenIcon,
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  goal: {
    icon: TargetIcon,
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  event: {
    icon: CalendarDaysIcon,
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
};

export function RecentActivity({
  items,
  now,
}: {
  items: ActivityItem[];
  now: Date;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Recent activity
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            A lightweight audit trail of what changed
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
          Live
        </span>
      </div>

      <CardContent className="p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <NotebookPenIcon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="text-[13px] font-medium">No activity yet</p>
            <p className="max-w-[230px] text-[11px] leading-relaxed text-muted-foreground">
              Completing a task, adding a transaction, checking in a habit, or
              editing a note will show up here.
            </p>
          </div>
        ) : (
        <ol className="relative space-y-4">
          {items.map((item, index) => {
            const style = ACTIVITY_STYLES[item.kind];
            const Icon = style.icon;
            const isLast = index === items.length - 1;

            return (
              <li key={item.id} className="relative flex gap-3">
                {!isLast ? (
                  <span
                    className="absolute top-8 bottom-[-18px] left-[15px] w-px bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-card",
                    style.className,
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[12px] font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <time
                  dateTime={item.timestamp}
                  className="shrink-0 pt-0.5 text-[10px] text-muted-foreground"
                >
                  {formatRelativeTime(item.timestamp, now)}
                </time>
              </li>
            );
          })}
        </ol>
        )}
      </CardContent>
    </Card>
  );
}
