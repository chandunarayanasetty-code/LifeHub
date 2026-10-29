"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";

interface NewTaskButtonProps {
  categories: string[];
  /** True when the page was opened with `?intent=create`. */
  autoOpen?: boolean;
  /** Current filters without `intent`, used to tidy the URL. */
  cleanHref?: string;
}

// A no-op store that reports when React has hydrated on the client. The task
// form's "today at 5 PM" default is calculated in the browser, so the dialog
// must not render during server rendering.
const subscribe = () => () => {};

export function NewTaskButton({
  categories,
  autoOpen = false,
  cleanHref = "/tasks",
}: NewTaskButtonProps) {
  const router = useRouter();
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = React.useState(false);

  const dialogOpen =
    open || (hydrated && autoOpen && !autoOpenDismissed);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setAutoOpenDismissed(true);
      if (autoOpen) {
        // Drop the one-off intent parameter while keeping active filters.
        router.replace(cleanHref, { scroll: false });
      }
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
        New task
      </Button>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        categories={categories}
      />
    </>
  );
}
