import type { ZodError } from "zod";

/** Read a text field without trusting the browser. */
export function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Turn a Zod error into the field → messages map the forms render. */
export function toFieldErrors<T extends string = string>(
  error: ZodError,
): Partial<Record<T, string[]>> {
  const fieldErrors: Partial<Record<T, string[]>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    const field = key as T;
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }

  return fieldErrors;
}

export interface FormActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
}

export const initialFormActionState: FormActionState = { status: "idle" };
