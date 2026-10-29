import type { TaskFormValues } from "./schema";

/**
 * Serialisable result of a task form action.
 *
 * This lives outside `actions.ts` because a `"use server"` module may only
 * export async functions — plain constants and types belong in a normal file.
 */
export interface TaskActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof TaskFormValues, string[]>>;
}

export const initialTaskActionState: TaskActionState = {
  status: "idle",
};
