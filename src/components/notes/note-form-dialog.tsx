"use client";

import * as React from "react";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveNoteAction } from "@/lib/notes/actions";
import {
  initialNoteActionState,
  type NoteActionState,
} from "@/lib/notes/schema";
import type { NoteDocument } from "@/lib/notes/repository";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteDocument;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

function NoteForm({
  note,
  onCancel,
  onSaved,
}: {
  note?: NoteDocument;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    NoteActionState,
    FormData
  >(saveNoteAction, initialNoteActionState);
  const fieldId = React.useId();

  const [values, setValues] = React.useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
    tags: note?.tags.join(", ") ?? "",
    pinned: note?.pinned ?? false,
  });

  function setField<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  React.useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state.status, onSaved]);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <>
      <DialogHeader>
        <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
        <DialogDescription>
          Notes are plain text, stored in your account. Titles, tags, and pin
          state are searchable from the command palette.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {note ? <input type="hidden" name="id" value={note.id} /> : null}

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-title`}>Title</Label>
          <Input
            id={`${fieldId}-title`}
            name="title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="e.g. Weekly review prompts"
            maxLength={120}
            required
            autoFocus
            className="h-9"
            aria-invalid={Boolean(fieldErrors.title)}
          />
          <FieldError messages={fieldErrors.title} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-content`}>Note</Label>
          <Textarea
            id={`${fieldId}-content`}
            name="content"
            value={values.content}
            onChange={(event) => setField("content", event.target.value)}
            placeholder="Write freely. Line breaks are preserved."
            maxLength={10_000}
            rows={9}
            className="min-h-44"
            aria-invalid={Boolean(fieldErrors.content)}
          />
          <FieldError messages={fieldErrors.content} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-tags`}>Tags</Label>
            <Input
              id={`${fieldId}-tags`}
              name="tags"
              value={values.tags}
              onChange={(event) => setField("tags", event.target.value)}
              placeholder="ideas, planning"
              className="h-9"
              aria-invalid={Boolean(fieldErrors.tags)}
            />
            <p className="text-[10px] text-muted-foreground">
              Comma separated, up to 8 tags.
            </p>
            <FieldError messages={fieldErrors.tags} />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                name="pinned"
                checked={values.pinned}
                onChange={(event) => setField("pinned", event.target.checked)}
                className="size-3.5 rounded border-input accent-primary"
              />
              Pin this note to the top
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-1.5">
            {isPending ? (
              <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {isPending ? "Saving…" : note ? "Save changes" : "Create note"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function NoteFormDialog({
  open,
  onOpenChange,
  note,
}: NoteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {open ? (
          <NoteForm
            note={note}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
