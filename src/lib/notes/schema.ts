import { z } from "zod";

import type { FormActionState } from "@/lib/form-utils";
import { normalizeTags } from "@/lib/tags";

export const noteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a title.")
    .max(120, "Keep the title under 120 characters."),
  content: z
    .string()
    .trim()
    .max(10_000, "Keep the note under 10,000 characters."),
  tags: z
    .string()
    .max(400, "That is too many tags.")
    .optional()
    .default("")
    .refine(
      (value) => normalizeTags(value).length <= 8,
      "Use 8 tags or fewer.",
    )
    .refine(
      (value) => normalizeTags(value).every((tag) => tag.length <= 24),
      "Each tag must be 24 characters or fewer.",
    ),
  pinned: z.enum(["on", "off"]).optional().default("off"),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export type NoteActionState = FormActionState;
export const initialNoteActionState: NoteActionState = { status: "idle" };

export function noteTags(values: NoteFormValues): string[] {
  return normalizeTags(values.tags ?? "");
}

export function noteIsPinned(values: NoteFormValues): boolean {
  return values.pinned === "on";
}
