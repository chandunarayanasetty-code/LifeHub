import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  MapPinIcon,
  PlusIcon,
} from "lucide-react";

import {
  DeleteEventButton,
  EditEventButton,
  NewEventButton,
} from "@/components/calendar/event-buttons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { listEvents } from "@/lib/calendar/repository";
import {
  EVENT_COLOR_STYLES,
  buildCalendarMonth,
  eventDurationMinutes,
  eventsInMonth,
  groupEventsByDay,
  groupTasksByDay,
  resolveMonth,
  shiftMonth,
  toMonthKey,
  weekdayLabels,
} from "@/lib/calendar/query";
import { isSameDay, startOfDay, toDateKey } from "@/lib/date";
import { formatShortDate, formatTime } from "@/lib/format";
import { listTasks } from "@/lib/tasks/repository";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Calendar",
};

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{
    month?: string;
    intent?: string;
    date?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();

  const month = resolveMonth(params.month, now);
  const weekStartsOn = user.weekStartsOn === 0 ? 0 : 1;
  const calendar = buildCalendarMonth(month, weekStartsOn);

  const [events, tasks] = await Promise.all([
    listEvents(user.id),
    listTasks(user.id),
  ]);

  const eventsByDay = groupEventsByDay(events);
  const tasksByDay = groupTasksByDay(tasks);
  const monthEvents = eventsInMonth(events, month).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const todayKey = toDateKey(now);
  const defaultDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : undefined;
  const cleanHref =
    calendar.key === toMonthKey(now) ? "/calendar" : `/calendar?month=${calendar.key}`;
  const autoOpen = params.intent === "create";

  const weekdays = weekdayLabels(weekStartsOn);
  const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Calendar"
        title="Calendar"
        description="One timeline for appointments, deadlines, and the shape of your week. Events are stored in your account; tasks due on a day appear alongside them."
        actions={
          <NewEventButton
            autoOpen={autoOpen}
            cleanHref={cleanHref}
            defaultDate={defaultDate}
          />
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/calendar?month=${shiftMonth(month, -1)}`}
            aria-label="Previous month"
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/calendar?month=${shiftMonth(month, 1)}`}
            aria-label="Next month"
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Link>
          <h2 className="ml-1.5 text-[16px] font-semibold tracking-tight">
            {calendar.label}
          </h2>
          <Link
            href="/calendar"
            className="ml-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Today
          </Link>
        </div>

        <Badge variant="outline" className="h-6 gap-1.5 px-2 text-[10px]">
          <CalendarDaysIcon className="size-3" aria-hidden="true" />
          {monthEvents.length} {monthEvents.length === 1 ? "event" : "events"} this month
        </Badge>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="grid grid-cols-7 border-b border-border/70 bg-muted/20">
          {weekdays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendar.weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const key = toDateKey(day);
              const inMonth = key.startsWith(monthPrefix);
              const isToday = isSameDay(day, now);
              const dayEvents = eventsByDay.get(key) ?? [];
              const dayTasks = tasksByDay.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[104px] border-r border-b border-border/60 p-1.5 sm:min-h-[124px]",
                    dayIndex === 6 && "border-r-0",
                    weekIndex === 5 && "border-b-0",
                    !inMonth && "bg-muted/20",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <Link
                      href={`/calendar?month=${toMonthKey(day)}&intent=create&date=${key}`}
                      title={`Add an event on ${formatShortDate(day)}`}
                      className={cn(
                        "grid size-6 place-items-center rounded-full text-[11px] font-medium tabular-nums transition-colors hover:bg-primary/10 hover:text-primary",
                        !inMonth && "text-muted-foreground/60",
                        isToday && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                      )}
                    >
                      {day.getDate()}
                    </Link>
                    <Link
                      href={`/calendar?month=${toMonthKey(day)}&intent=create&date=${key}`}
                      aria-label={`Add an event on ${formatShortDate(day)}`}
                      className="grid size-5 place-items-center rounded text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:bg-muted focus-visible:text-muted-foreground"
                    >
                      <PlusIcon className="size-3" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Link
                        key={event.id}
                        href={`/calendar?month=${toMonthKey(day)}`}
                        className={cn(
                          "block truncate rounded border-l-2 px-1.5 py-0.5 text-[10px] leading-snug transition-opacity hover:opacity-80",
                          EVENT_COLOR_STYLES[event.color].block,
                        )}
                        title={event.title}
                      >
                        {event.allDay ? "All day" : formatTime(event.start)}{" "}
                        {event.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 ? (
                      <p className="px-1.5 text-[9.5px] text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </p>
                    ) : null}
                    {dayTasks.length > 0 ? (
                      <Link
                        href="/tasks"
                        className="block px-1.5 text-[9.5px] font-medium text-primary hover:underline"
                      >
                        {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"} due
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </Card>

      <section aria-label="Events this month" className="grid gap-3 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Agenda
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {calendar.label}
              </p>
            </div>
            <Link
              href={`/calendar?intent=create&month=${calendar.key}`}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Add event
            </Link>
          </div>

          <CardContent className="p-2">
            {monthEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                  <CalendarDaysIcon className="size-4.5" aria-hidden="true" />
                </span>
                <p className="text-[13px] font-medium">Nothing scheduled</p>
                <p className="max-w-[260px] text-[11px] leading-relaxed text-muted-foreground">
                  This month is clear. Add an event, or pick a day in the grid
                  above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {monthEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start gap-3 px-2 py-2.5"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        EVENT_COLOR_STYLES[event.color].dot,
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">
                        {event.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock3Icon className="size-3" aria-hidden="true" />
                          {formatShortDate(event.start)}
                          {event.allDay
                            ? " · All day"
                            : ` · ${formatTime(event.start)} – ${formatTime(event.end)}`}
                        </span>
                        {event.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="size-3" aria-hidden="true" />
                            {event.location}
                          </span>
                        ) : null}
                        <span>{eventDurationMinutes(event)} min</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <EditEventButton event={event} />
                      <DeleteEventButton event={event} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Today
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatShortDate(now)} · {todayKey}
              </p>
            </div>
          </div>
          <CardContent className="p-4">
            {(() => {
              const todaysEvents = eventsByDay.get(todayKey) ?? [];
              const todaysTasks = tasksByDay.get(todayKey) ?? [];
              const overdue = tasks.filter(
                (task) =>
                  (task.status === "todo" || task.status === "in-progress") &&
                  startOfDay(new Date(task.dueDate)) < startOfDay(now),
              );

              if (todaysEvents.length === 0 && todaysTasks.length === 0) {
                return (
                  <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                    Nothing is scheduled for today and no task is due. A clear
                    day — use it however you like.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {todaysEvents.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Events
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {todaysEvents.map((event) => (
                          <li
                            key={event.id}
                            className="flex items-center gap-2 text-[11.5px]"
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                EVENT_COLOR_STYLES[event.color].dot,
                              )}
                              aria-hidden="true"
                            />
                            <span className="tabular-nums text-muted-foreground">
                              {event.allDay ? "All day" : formatTime(event.start)}
                            </span>
                            <span className="truncate font-medium">
                              {event.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {todaysTasks.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Tasks due
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {todaysTasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center gap-2 text-[11.5px]"
                          >
                            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                            <span className="truncate">{task.title}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">
                              {task.priority}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {overdue.length > 0 ? (
                    <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-2.5 py-1.5 text-[10.5px] text-amber-700 dark:text-amber-400">
                      {overdue.length} overdue{" "}
                      {overdue.length === 1 ? "task" : "tasks"} from earlier days.
                    </p>
                  ) : null}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
