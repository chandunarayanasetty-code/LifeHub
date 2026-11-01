import { getDb } from "@/lib/db/client";
import { toCalendarEvent } from "@/lib/db/mappers";
import type { CalendarEvent } from "@/lib/types";

import { resolveEventRange, type EventFormValues } from "./schema";

/** Calendar repository. Every query is scoped to the signed-in user. */

export async function listEvents(userId: string): Promise<CalendarEvent[]> {
  const prisma = await getDb();
  const records = await prisma.calendarEvent.findMany({
    where: { userId },
    orderBy: { start: "asc" },
  });
  return records.map(toCalendarEvent);
}

function fieldsFromForm(values: EventFormValues) {
  const range = resolveEventRange(values);
  return {
    title: values.title,
    description: values.description,
    start: range.start,
    end: range.end,
    allDay: range.allDay,
    location: values.location || null,
    color: values.color,
  };
}

export async function createEvent(
  userId: string,
  values: EventFormValues,
): Promise<CalendarEvent> {
  const prisma = await getDb();
  const record = await prisma.calendarEvent.create({
    data: { userId, ...fieldsFromForm(values) },
  });
  return toCalendarEvent(record);
}

export async function updateEvent(
  userId: string,
  id: string,
  values: EventFormValues,
): Promise<CalendarEvent | null> {
  const prisma = await getDb();
  const existing = await prisma.calendarEvent.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.calendarEvent.update({
    where: { id: existing.id },
    data: fieldsFromForm(values),
  });
  return toCalendarEvent(record);
}

export async function removeEvent(userId: string, id: string): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.calendarEvent.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
