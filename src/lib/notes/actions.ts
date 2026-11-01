"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { readField, toFieldErrors } from "@/lib/form-utils";

import {
  createNote,
  removeNote,
  setNotePinned,
  updateNote,
} from "./repository";
import {
  noteFormSchema,
  type NoteActionState,
  type NoteFormValues,
} from "./schema";

function revalidateNoteViews() {
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function saveNoteAction(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const user = await requireUser();

  const parsed = noteFormSchema.safeParse({
    title: readField(formData, "title"),
    content: readField(formData, "content"),
    tags: readField(formData, "tags"),
    pinned: readField(formData, "pinned") === "on" ? "on" : "off",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors<keyof NoteFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateNote(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That note no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createNote(user.id, parsed.data);
    }
  } catch (error) {
    console.error("[notes] Failed to save note", error);
    return {
      status: "error",
      message: "The note could not be saved. Check the server log, then try again.",
    };
  }

  revalidateNoteViews();
  return {
    status: "success",
    message: id ? "Note updated." : "Note created.",
  };
}

export async function deleteNoteAction(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) return { status: "error", message: "Missing note id." };

  try {
    const removed = await removeNote(user.id, id);
    if (!removed) {
      return { status: "error", message: "That note was already removed." };
    }
  } catch (error) {
    console.error("[notes] Failed to delete note", error);
    return {
      status: "error",
      message: "The note could not be deleted. Please try again.",
    };
  }

  revalidateNoteViews();
  return { status: "success", message: "Note deleted." };
}

export async function toggleNotePinnedAction(
  id: string,
  pinned: boolean,
): Promise<void> {
  if (!id) return;
  const user = await requireUser();

  try {
    await setNotePinned(user.id, id, pinned);
  } catch (error) {
    console.error("[notes] Failed to update pinned state", error);
    return;
  }

  revalidateNoteViews();
}
