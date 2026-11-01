"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { TransactionFormDialog } from "@/components/expenses/transaction-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTransactionAction } from "@/lib/expenses/actions";
import {
  initialExpenseActionState,
  type ExpenseActionState,
} from "@/lib/expenses/schema";
import type { FinancialTransaction } from "@/lib/types";

const subscribe = () => () => {};

export function NewTransactionButton({
  categories,
  currency,
  autoOpen = false,
  cleanHref = "/expenses",
}: {
  categories: string[];
  currency: string;
  autoOpen?: boolean;
  cleanHref?: string;
}) {
  const router = useRouter();
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = React.useState(false);

  const dialogOpen = open || (hydrated && autoOpen && !autoOpenDismissed);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAutoOpenDismissed(true);
      if (autoOpen) router.replace(cleanHref, { scroll: false });
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
        Add transaction
      </Button>

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        categories={categories}
        currency={currency}
      />
    </>
  );
}

export function EditTransactionButton({
  transaction,
  categories,
  currency,
}: {
  transaction: FinancialTransaction;
  categories: string[];
  currency: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit transaction ${transaction.description || transaction.category}`}
        title="Edit transaction"
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </Button>

      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        transaction={transaction}
        categories={categories}
        currency={currency}
      />
    </>
  );
}

function DeleteForm({
  transaction,
  onCancel,
  onDeleted,
}: {
  transaction: FinancialTransaction;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    ExpenseActionState,
    FormData
  >(deleteTransactionAction, initialExpenseActionState);

  React.useEffect(() => {
    if (state.status === "success") onDeleted();
  }, [state.status, onDeleted]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={transaction.id} />

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[12px] font-medium">
        {transaction.description || transaction.category}
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
          {isPending ? "Deleting…" : "Delete transaction"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteTransactionButton({
  transaction,
}: {
  transaction: FinancialTransaction;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Delete transaction ${transaction.description || transaction.category}`}
        title="Delete transaction"
        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>
              This removes the record from your account. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteForm
              transaction={transaction}
              onCancel={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
