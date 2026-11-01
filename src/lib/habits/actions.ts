"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { toDateKey } from "@/lib/date";
import { readField, toFieldErrors } from "@/lib/form-utils";

import {
  createHabit,
  removeHabit,
  toggleHabitCompletion,
  updateHabit,
} from "./repository";
import {
  dateKeySchema,
  habitFormSchema,
  type HabitActionState,
  type HabitFormValues,
} from "./schema";

function revalidateHabitViews() {
  revalidatePath("/habits");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function saveHabitAction(
  _previousState: HabitActionState,
  formData: FormData,
): Promise<HabitActionState> {
  const user = await requireUser();

  const parsed = habitFormSchema.safeParse({
    name: readField(formData, "name"),
    icon: readField(formData, "icon"),
    frequency: readField(formData, "frequency"),
    color: readField(formData, "color"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors<keyof HabitFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateHabit(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That habit no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createHabit(user.id, parsed.data);
    }
  } catch (error) {
    console.error("[habits] Failed to save habit", error);
    return {
      status: "error",
      message: "The habit could not be saved. Check the server log, then try again.",
    };
  }

  revalidateHabitViews();
  return {
    status: "success",
    message: id ? "Habit updated." : "Habit created.",
  };
}

export async function deleteHabitAction(
  _previousState: HabitActionState,
  formData: FormData,
): Promise<HabitActionState> {
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) return { status: "error", message: "Missing habit id." };

  try {
    const removed = await removeHabit(user.id, id);
    if (!removed) {
      return { status: "error", message: "That habit was already removed." };
    }
  } catch (error) {
    console.error("[habits] Failed to delete habit", error);
    return {
      status: "error",
      message: "The habit could not be deleted. Please try again.",
    };
  }

  revalidateHabitViews();
  return { status: "success", message: "Habit deleted." };
}

/** Toggle a check-in from the weekly grid. */
export async function toggleHabitAction(
  habitId: string,
  dateKey: string,
): Promise<void> {
  const parsedHabit = habitId.trim();
  const parsedDate = dateKeySchema.safeParse(dateKey);
  if (!parsedHabit || !parsedDate.success) return;

  // Future days cannot be checked off.
  if (parsedDate.data > toDateKey(new Date())) return;

  const user = await requireUser();

  try {
    await toggleHabitCompletion(user.id, parsedHabit, parsedDate.data);
  } catch (error) {
    console.error("[habits] Failed to toggle check-in", error);
    return;
  }

  revalidateHabitViews();
}
