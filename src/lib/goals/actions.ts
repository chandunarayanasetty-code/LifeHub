"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { readField, toFieldErrors } from "@/lib/form-utils";

import {
  createGoal,
  incrementGoal,
  removeGoal,
  updateGoal,
} from "./repository";
import {
  goalFormSchema,
  type GoalActionState,
  type GoalFormValues,
} from "./schema";

function revalidateGoalViews() {
  revalidatePath("/goals");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function saveGoalAction(
  _previousState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const user = await requireUser();

  const parsed = goalFormSchema.safeParse({
    title: readField(formData, "title"),
    description: readField(formData, "description"),
    category: readField(formData, "category"),
    current: readField(formData, "current"),
    target: readField(formData, "target"),
    unit: readField(formData, "unit"),
    deadline: readField(formData, "deadline"),
    status: readField(formData, "status"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors<keyof GoalFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateGoal(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That goal no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createGoal(user.id, parsed.data);
    }
  } catch (error) {
    console.error("[goals] Failed to save goal", error);
    return {
      status: "error",
      message: "The goal could not be saved. Check the server log, then try again.",
    };
  }

  revalidateGoalViews();
  return {
    status: "success",
    message: id ? "Goal updated." : "Goal created.",
  };
}

export async function deleteGoalAction(
  _previousState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) return { status: "error", message: "Missing goal id." };

  try {
    const removed = await removeGoal(user.id, id);
    if (!removed) {
      return { status: "error", message: "That goal was already removed." };
    }
  } catch (error) {
    console.error("[goals] Failed to delete goal", error);
    return {
      status: "error",
      message: "The goal could not be deleted. Please try again.",
    };
  }

  revalidateGoalViews();
  return { status: "success", message: "Goal deleted." };
}

export async function incrementGoalAction(
  id: string,
  amount: number,
): Promise<void> {
  if (!id || !Number.isFinite(amount)) return;
  const user = await requireUser();

  try {
    await incrementGoal(user.id, id, Math.trunc(amount));
  } catch (error) {
    console.error("[goals] Failed to update progress", error);
    return;
  }

  revalidateGoalViews();
}
