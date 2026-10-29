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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  initialTaskActionState,
  type TaskActionState,
} from "@/lib/tasks/action-types";
import { saveTaskAction } from "@/lib/tasks/actions";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  defaultDueDateValue,
  toDateTimeLocalValue,
} from "@/lib/tasks/schema";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  /** Present when editing an existing task. */
  task?: Task;
}

interface FormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string;
  tags: string;
}

function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

function TaskForm({
  task,
  categories,
  onCancel,
  onSaved,
}: {
  task?: Task;
  categories: string[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    TaskActionState,
    FormData
  >(saveTaskAction, initialTaskActionState);

  const fieldId = React.useId();
  const categoryListId = `${fieldId}-categories`;

  // Controlled fields matter: React resets uncontrolled fields after every
  // form action, which would erase the user's work when validation fails.
  const [values, setValues] = React.useState<FormValues>(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    category: task?.category ?? "",
    dueDate: task
      ? toDateTimeLocalValue(task.dueDate)
      : defaultDueDateValue(),
    tags: task?.tags.join(", ") ?? "",
  }));

  function setField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  React.useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  const fieldErrors = state.fieldErrors ?? {};
  const inputClassName = "h-9";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription>
          {task
            ? "Update the details below. Changes are saved to this workspace's local task file."
            : "Add a task to your list. It will be saved to this workspace's local task file."}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {task ? <input type="hidden" name="id" value={task.id} /> : null}

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
            placeholder="e.g. Book dentist appointment"
            maxLength={120}
            required
            autoFocus
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={
              fieldErrors.title ? `${fieldId}-title-error` : undefined
            }
            className={inputClassName}
          />
          <FieldError
            id={`${fieldId}-title-error`}
            messages={fieldErrors.title}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-description`}>Description</Label>
          <Textarea
            id={`${fieldId}-description`}
            name="description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="Any details that will help future you."
            maxLength={1000}
            rows={3}
            className="min-h-20"
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description
                ? `${fieldId}-description-error`
                : undefined
            }
          />
          <FieldError
            id={`${fieldId}-description-error`}
            messages={fieldErrors.description}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-status`}>Status</Label>
            <NativeSelect
              id={`${fieldId}-status`}
              name="status"
              value={values.status}
              onChange={(event) =>
                setField("status", event.target.value as TaskStatus)
              }
              className="h-9"
              aria-invalid={Boolean(fieldErrors.status)}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </NativeSelect>
            <FieldError
              id={`${fieldId}-status-error`}
              messages={fieldErrors.status}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-priority`}>Priority</Label>
            <NativeSelect
              id={`${fieldId}-priority`}
              name="priority"
              value={values.priority}
              onChange={(event) =>
                setField("priority", event.target.value as TaskPriority)
              }
              className="h-9"
              aria-invalid={Boolean(fieldErrors.priority)}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </NativeSelect>
            <FieldError
              id={`${fieldId}-priority-error`}
              messages={fieldErrors.priority}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-category`}>Category</Label>
            <Input
              id={`${fieldId}-category`}
              name="category"
              value={values.category}
              onChange={(event) => setField("category", event.target.value)}
              placeholder="Work, Home, Health…"
              list={categoryListId}
              maxLength={40}
              required
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={
                fieldErrors.category ? `${fieldId}-category-error` : undefined
              }
              className={inputClassName}
            />
            <datalist id={categoryListId}>
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FieldError
              id={`${fieldId}-category-error`}
              messages={fieldErrors.category}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-dueDate`}>Due date</Label>
            <Input
              id={`${fieldId}-dueDate`}
              name="dueDate"
              type="datetime-local"
              value={values.dueDate}
              onChange={(event) => setField("dueDate", event.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.dueDate)}
              aria-describedby={
                fieldErrors.dueDate ? `${fieldId}-dueDate-error` : undefined
              }
              className={inputClassName}
            />
            <FieldError
              id={`${fieldId}-dueDate-error`}
              messages={fieldErrors.dueDate}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-tags`}>Tags</Label>
          <Input
            id={`${fieldId}-tags`}
            name="tags"
            value={values.tags}
            onChange={(event) => setField("tags", event.target.value)}
            placeholder="budget, review"
            aria-invalid={Boolean(fieldErrors.tags)}
            aria-describedby={
              fieldErrors.tags
                ? `${fieldId}-tags-error`
                : `${fieldId}-tags-hint`
            }
            className={inputClassName}
          />
          <p
            id={`${fieldId}-tags-hint`}
            className={cn(
              "text-[10px] leading-relaxed text-muted-foreground",
              fieldErrors.tags && "sr-only",
            )}
          >
            Comma separated. Up to 8 tags, 24 characters each.
          </p>
          <FieldError
            id={`${fieldId}-tags-error`}
            messages={fieldErrors.tags}
          />
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
            {isPending ? "Saving…" : task ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TaskFormDialog({
  open,
  onOpenChange,
  categories,
  task,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {open ? (
          <TaskForm
            task={task}
            categories={categories}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
