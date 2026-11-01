import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLOR_STYLES: Record<CalendarEvent["color"], string> = {
  violet:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  emerald:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  sky: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function dayLabel(event: CalendarEvent, now: Date): string {
  const start = new Date(event.start);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (start.toDateString() === today.toDateString()) return "Today";
  if (start.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
}

export function UpcomingEvents({
  events,
  now,
}: {
  events: CalendarEvent[];
  now: Date;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Upcoming
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Events and appointments
          </p>
        </div>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Calendar
          <ArrowRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <CardContent className="p-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <CalendarDaysIcon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="text-[13px] font-medium">No upcoming events</p>
            <p className="max-w-[220px] text-[11px] text-muted-foreground">
              Scheduled events will appear here once you add them in Calendar.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {events.map((event) => {
              const start = new Date(event.start);
              const month = new Intl.DateTimeFormat("en-US", {
                month: "short",
              })
                .format(start)
                .toUpperCase();
              const day = start.getDate();

              return (
                <li
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5"
                >
                  <div
                    className={cn(
                      "flex w-10 shrink-0 flex-col items-center rounded-lg border py-1.5",
                      COLOR_STYLES[event.color],
                    )}
                  >
                    <span className="text-[8px] font-semibold tracking-[0.1em]">
                      {month}
                    </span>
                    <span className="text-[15px] leading-none font-semibold tabular-nums">
                      {day}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium">
                      {event.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {dayLabel(event, now)} ·{" "}
                      {event.allDay
                        ? "All day"
                        : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                    </p>
                    {event.location ? (
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                        {event.location}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
