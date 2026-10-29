"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import type { TaskStatus } from "@/lib/types";

import type { TaskActionState } from "./action-types";
import {
  createTask,
  removeTask,
  resetTasks,
  setTaskStatus,
  updateTask,
} from "./repository";
import { taskFormSchema, taskStatusSchema, type TaskFormValues } from "./schema";

/**
 * Server actions for every task mutation.
 *
 * The browser can be bypassed, so each action re-validates its input and
 * returns a serialisable state object for `useActionState` instead of throwing
 * raw errors at the user.
 */

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/");
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function toFieldErrors(
  error: ZodError,
): Partial<Record<keyof TaskFormValues, string[]>> {
  const fieldErrors: Partial<Record<keyof TaskFormValues, string[]>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;

    const field = key as keyof TaskFormValues;
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function saveTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const parsed = taskFormSchema.safeParse({
    title: readField(formData, "title"),
    description: readField(formData, "description"),
    status: readField(formData, "status"),
    priority: readField(formData, "priority"),
    category: readField(formData, "category"),
    dueDate: readField(formData, "dueDate"),
    tags: readField(formData, "tags"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateTask(id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That task no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createTask(parsed.data);
    }
  } catch (error) {
    console.error("[tasks] Failed to save task", error);
    return {
      status: "error",
      message:
        "The task could not be saved. Check the server log, then try again.",
    };
  }

  revalidateTaskViews();

  return {
    status: "success",
    message: id ? "Task updated." : "Task created.",
  };
}

export async function deleteTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const id = readField(formData, "id").trim();

  if (!id) {
    return { status: "error", message: "Missing task id." };
  }

  try {
    const removed = await removeTask(id);
    if (!removed) {
      return {
        status: "error",
        message: "That task was already removed.",
      };
    }
  } catch (error) {
    console.error("[tasks] Failed to delete task", error);
    return {
      status: "error",
      message: "The task could not be deleted. Please try again.",
    };
  }

  revalidateTaskViews();
  return { status: "success", message: "Task deleted." };
}

/** Called directly from the completion toggle, not through a form. */
export async function setTaskStatusAction(
  id: string,
  status: TaskStatus,
): Promise<void> {
  const parsedStatus = taskStatusSchema.safeParse(status);
  if (!id || !parsedStatus.success) return;

  try {
    const updated = await setTaskStatus(id, parsedStatus.data);
    if (!updated) return;
  } catch (error) {
    console.error("[tasks] Failed to change task status", error);
    return;
  }

  revalidateTaskViews();
}

export async function resetTasksAction(
  _previousState: TaskActionState,
  _formData: FormData,
): Promise<TaskActionState> {
  void _previousState;
  void _formData;

  try {
    await resetTasks();
  } catch (error) {
    console.error("[tasks] Failed to reset task data", error);
    return {
      status: "error",
      message: "The task file could not be reset. Check the server log.",
    };
  }

  revalidateTaskViews();
  return { status: "success", message: "Sample tasks restored." };
}
