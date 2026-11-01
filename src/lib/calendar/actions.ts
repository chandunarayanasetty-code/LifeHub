"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { readField, toFieldErrors } from "@/lib/form-utils";

import {
  createEvent,
  removeEvent,
  updateEvent,
} from "./repository";
import {
  eventFormSchema,
  type EventActionState,
  type EventFormValues,
} from "./schema";

function revalidateCalendarViews() {
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function saveEventAction(
  _previousState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireUser();

  const parsed = eventFormSchema.safeParse({
    title: readField(formData, "title"),
    description: readField(formData, "description"),
    start: readField(formData, "start"),
    end: readField(formData, "end"),
    allDay: readField(formData, "allDay") === "on" ? "on" : "off",
    location: readField(formData, "location"),
    color: readField(formData, "color"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors<keyof EventFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateEvent(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That event no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createEvent(user.id, parsed.data);
    }
  } catch (error) {
    console.error("[calendar] Failed to save event", error);
    return {
      status: "error",
      message: "The event could not be saved. Check the server log, then try again.",
    };
  }

  revalidateCalendarViews();
  return {
    status: "success",
    message: id ? "Event updated." : "Event created.",
  };
}

export async function deleteEventAction(
  _previousState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) return { status: "error", message: "Missing event id." };

  try {
    const removed = await removeEvent(user.id, id);
    if (!removed) {
      return { status: "error", message: "That event was already removed." };
    }
  } catch (error) {
    console.error("[calendar] Failed to delete event", error);
    return {
      status: "error",
      message: "The event could not be deleted. Please try again.",
    };
  }

  revalidateCalendarViews();
  return { status: "success", message: "Event deleted." };
}
