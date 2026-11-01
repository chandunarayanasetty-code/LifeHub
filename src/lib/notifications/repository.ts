import { addDays, endOfDay, startOfDay, toDateKey } from "@/lib/date";
import { formatShortDate, formatTime } from "@/lib/format";
import { getDb } from "@/lib/db/client";
import { toNotification } from "@/lib/db/mappers";
import type { AppNotification } from "@/lib/types";

/**
 * In-app reminders.
 *
 * Reminders are generated from the user's own records and deduplicated with a
 * stable key, so loading the page repeatedly does not create duplicates. There
 * is no email or background delivery: this app never claims a reminder was sent
 * somewhere it cannot send.
 */

function dayBounds(now: Date) {
  return { start: startOfDay(now), end: endOfDay(now) };
}

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const prisma = await getDb();
  const records = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  return records.map(toNotification);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const prisma = await getDb();
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const prisma = await getDb();
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}

interface ReminderDraft {
  dedupeKey: string;
  title: string;
  description: string;
  href: string;
  kind: "deadline" | "event" | "goal";
}

/**
 * Build reminders that are true right now, insert missing ones, and remove
 * unread automatic reminders whose source condition no longer applies.
 */
export async function syncNotifications(
  userId: string,
  now = new Date(),
): Promise<void> {
  const prisma = await getDb();
  const { start, end } = dayBounds(now);
  const inTwoDays = addDays(end, 1);
  const inTwoWeeks = addDays(end, 14);
  const todayKey = toDateKey(now);

  const [tasks, events, goals] = await Promise.all([
    prisma.task.findMany({
      where: { userId, status: { in: ["todo", "in_progress"] } },
      select: { id: true, title: true, dueDate: true },
    }),
    prisma.calendarEvent.findMany({
      where: { userId, start: { gte: now, lte: inTwoDays } },
      select: { id: true, title: true, start: true, location: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: "active", deadline: { lte: inTwoWeeks } },
      select: { id: true, title: true, deadline: true },
    }),
  ]);

  const drafts: ReminderDraft[] = [];

  for (const task of tasks) {
    if (task.dueDate < start) {
      drafts.push({
        dedupeKey: `task-overdue:${task.id}`,
        title: "Overdue task",
        description: `${task.title} was due ${formatShortDate(task.dueDate)}.`,
        href: "/tasks",
        kind: "deadline",
      });
      continue;
    }

    if (task.dueDate <= end) {
      drafts.push({
        dedupeKey: `task-due:${task.id}:${todayKey}`,
        title: "Task due today",
        description: `${task.title} is due at ${formatTime(task.dueDate)}.`,
        href: "/tasks",
        kind: "deadline",
      });
    }
  }

  for (const event of events) {
    drafts.push({
      dedupeKey: `event:${event.id}:${toDateKey(event.start)}`,
      title: `Upcoming: ${event.title}`,
      description: `${formatShortDate(event.start)} at ${formatTime(event.start)}${
        event.location ? ` · ${event.location}` : ""
      }.`,
      href: "/calendar",
      kind: "event",
    });
  }

  for (const goal of goals) {
    if (goal.deadline < start) {
      drafts.push({
        dedupeKey: `goal-overdue:${goal.id}`,
        title: "Goal deadline passed",
        description: `${goal.title} reached its deadline on ${formatShortDate(goal.deadline)}.`,
        href: "/goals",
        kind: "goal",
      });
      continue;
    }

    const daysLeft = Math.ceil(
      (startOfDay(goal.deadline).getTime() - start.getTime()) / 86_400_000,
    );
    drafts.push({
      dedupeKey: `goal:${goal.id}:${toDateKey(goal.deadline)}`,
      title: "Goal deadline approaching",
      description: `${goal.title} is due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}.`,
      href: "/goals",
      kind: "goal",
    });
  }

  if (drafts.length > 0) {
    await prisma.notification.createMany({
      data: drafts.map((draft) => ({ userId, ...draft })),
      skipDuplicates: true,
    });
  }

  // Remove unread automatic reminders that are no longer true. Seeded/example
  // reminders use a "seed:" prefix and are left alone.
  const keep = drafts.map((draft) => draft.dedupeKey);
  await prisma.notification.deleteMany({
    where: {
      userId,
      read: false,
      OR: [
        { dedupeKey: { startsWith: "task-" } },
        { dedupeKey: { startsWith: "event:" } },
        { dedupeKey: { startsWith: "goal" } },
      ],
      ...(keep.length > 0 ? { dedupeKey: { notIn: keep } } : {}),
    },
  });

  // Trim very old read history so the list stays useful.
  await prisma.notification.deleteMany({
    where: { userId, read: true, createdAt: { lt: addDays(now, -60) } },
  });
}
