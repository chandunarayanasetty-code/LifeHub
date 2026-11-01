"use server";

import { revalidatePath } from "next/cache";

import type { TaskStatus } from "@/lib/types";
import { requireUser } from "@/lib/auth/session";
import { readField, toFieldErrors } from "@/lib/form-utils";

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
 * The browser can be bypassed, so each action authenticates the caller,
 * re-validates its input, and scopes the write to that user. Errors are returned
 * as serialisable state for `useActionState` instead of throwing raw errors.
 */

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function saveTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const user = await requireUser();

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
      fieldErrors: toFieldErrors<keyof TaskFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateTask(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message: "That task no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createTask(user.id, parsed.data);
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
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) {
    return { status: "error", message: "Missing task id." };
  }

  try {
    const removed = await removeTask(user.id, id);
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

  const user = await requireUser();

  try {
    const updated = await setTaskStatus(user.id, id, parsedStatus.data);
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

  const user = await requireUser();
  if (!user.isDemo) {
    return {
      status: "error",
      message:
        "Sample data can only be restored in the demo workspace. Your account keeps its real records.",
    };
  }

  try {
    await resetTasks(user.id);
  } catch (error) {
    console.error("[tasks] Failed to reset sample tasks", error);
    return {
      status: "error",
      message: "The sample tasks could not be restored. Check the server log.",
    };
  }

  revalidateTaskViews();
  return { status: "success", message: "Sample tasks restored." };
}
