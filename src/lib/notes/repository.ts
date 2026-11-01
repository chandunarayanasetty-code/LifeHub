import { getDb } from "@/lib/db/client";
import { toNote } from "@/lib/db/mappers";
import type { Note } from "@/lib/types";

import { noteIsPinned, noteTags, type NoteFormValues } from "./schema";

/** Note repository. Every query is scoped to the signed-in user. */

export interface NoteDocument extends Note {
  /** Full note body. The list only renders `excerpt`. */
  content: string;
}

export async function listNotes(userId: string): Promise<Note[]> {
  const prisma = await getDb();
  const records = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return records.map(toNote);
}

export async function listNoteDocuments(
  userId: string,
): Promise<NoteDocument[]> {
  const prisma = await getDb();
  const records = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return records.map((record) => ({
    ...toNote(record),
    content: record.content,
  }));
}

export async function getNoteContent(
  userId: string,
  id: string,
): Promise<{ note: Note; content: string } | null> {
  const prisma = await getDb();
  const record = await prisma.note.findFirst({ where: { id, userId } });
  return record ? { note: toNote(record), content: record.content } : null;
}

function fieldsFromForm(values: NoteFormValues) {
  return {
    title: values.title,
    content: values.content,
    tags: noteTags(values),
    pinned: noteIsPinned(values),
  };
}

export async function createNote(
  userId: string,
  values: NoteFormValues,
): Promise<Note> {
  const prisma = await getDb();
  const record = await prisma.note.create({
    data: { userId, ...fieldsFromForm(values) },
  });
  return toNote(record);
}

export async function updateNote(
  userId: string,
  id: string,
  values: NoteFormValues,
): Promise<Note | null> {
  const prisma = await getDb();
  const existing = await prisma.note.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.note.update({
    where: { id: existing.id },
    data: fieldsFromForm(values),
  });
  return toNote(record);
}

export async function setNotePinned(
  userId: string,
  id: string,
  pinned: boolean,
): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.note.updateMany({
    where: { id, userId },
    data: { pinned },
  });
  return result.count > 0;
}

export async function removeNote(userId: string, id: string): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.note.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
