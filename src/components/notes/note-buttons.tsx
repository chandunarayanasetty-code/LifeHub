"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteNoteAction, toggleNotePinnedAction } from "@/lib/notes/actions";
import {
  initialNoteActionState,
  type NoteActionState,
} from "@/lib/notes/schema";
import type { NoteDocument } from "@/lib/notes/repository";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

export function NewNoteButton({ autoOpen = false }: { autoOpen?: boolean }) {
  const router = useRouter();
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = React.useState(false);

  const dialogOpen = open || (hydrated && autoOpen && !autoOpenDismissed);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAutoOpenDismissed(true);
      if (autoOpen) router.replace("/notes", { scroll: false });
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-1.5 px-3 shadow-sm"
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        New note
      </Button>

      <NoteFormDialog open={dialogOpen} onOpenChange={handleOpenChange} />
    </>
  );
}

export function EditNoteButton({ note }: { note: NoteDocument }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${note.title}`}
        title="Edit note"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <NoteFormDialog open={open} onOpenChange={setOpen} note={note} />
    </>
  );
}

export function PinNoteButton({ note }: { note: NoteDocument }) {
  const [isPending, startTransition] = React.useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleNotePinnedAction(note.id, !note.pinned);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={note.pinned}
      aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
      title={note.pinned ? "Unpin note" : "Pin note"}
      className={cn(
        "size-7",
        note.pinned
          ? "text-primary hover:text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isPending ? (
        <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
      ) : note.pinned ? (
        <PinOffIcon className="size-3.5" aria-hidden="true" />
      ) : (
        <PinIcon className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}

function DeleteForm({
  note,
  onCancel,
  onDeleted,
}: {
  note: NoteDocument;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    NoteActionState,
    FormData
  >(deleteNoteAction, initialNoteActionState);

  React.useEffect(() => {
    if (state.status === "success") onDeleted();
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={note.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {note.title}
      </p>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2Icon className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Deleting…" : "Delete note"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteNoteButton({ note }: { note: NoteDocument }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${note.title}`}
        title="Delete note"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>
              This permanently removes the note from your account.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteForm
              note={note}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
