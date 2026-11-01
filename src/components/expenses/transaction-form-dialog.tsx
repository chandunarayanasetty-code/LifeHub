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
import { saveTransactionAction } from "@/lib/expenses/actions";
import {
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  centsToAmountInput,
  initialExpenseActionState,
  toDateInputValue,
  type ExpenseActionState,
  type TransactionFormValues,
} from "@/lib/expenses/schema";
import type { FinancialTransaction, TransactionType } from "@/lib/types";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: FinancialTransaction;
  categories: string[];
  currency: string;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-[10.5px] leading-snug font-medium text-destructive">
      {messages.join(" ")}
    </p>
  );
}

function TransactionForm({
  transaction,
  categories,
  currency,
  onCancel,
  onSaved,
}: {
  transaction?: FinancialTransaction;
  categories: string[];
  currency: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = React.useActionState<
    ExpenseActionState,
    FormData
  >(saveTransactionAction, initialExpenseActionState);

  const fieldId = React.useId();
  const categoryListId = `${fieldId}-categories`;

  const [values, setValues] = React.useState({
    type: (transaction?.type ?? "expense") as TransactionType,
    amount: transaction ? centsToAmountInput(transaction.amountCents) : "",
    category: transaction?.category ?? "",
    description: transaction?.description ?? "",
    date: toDateInputValue(transaction?.date ?? new Date()),
    paymentMethod: transaction?.paymentMethod ?? "Card",
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
        <DialogTitle>
          {transaction ? "Edit transaction" : "Add transaction"}
        </DialogTitle>
        <DialogDescription>
          Amounts are stored as whole minor units (for example cents), so totals
          never drift because of floating-point rounding.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-3.5">
        {transaction ? (
          <input type="hidden" name="id" value={transaction.id} />
        ) : null}

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-type`}>Type</Label>
            <NativeSelect
              id={`${fieldId}-type`}
              name="type"
              value={values.type}
              onChange={(event) =>
                setField("type", event.target.value as TransactionType)
              }
              className="h-9"
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TRANSACTION_TYPE_LABELS[type]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-amount`}>Amount ({currency})</Label>
            <Input
              id={`${fieldId}-amount`}
              name="amount"
              inputMode="decimal"
              value={values.amount}
              onChange={(event) => setField("amount", event.target.value)}
              placeholder="42.50"
              required
              autoFocus
              className="h-9 tabular-nums"
              aria-invalid={Boolean(fieldErrors.amount)}
            />
            <FieldError messages={fieldErrors.amount} />
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
              placeholder="Groceries, Rent, Salary…"
              list={categoryListId}
              maxLength={40}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.category)}
            />
            <datalist id={categoryListId}>
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FieldError messages={fieldErrors.category} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-date`}>Date</Label>
            <Input
              id={`${fieldId}-date`}
              name="date"
              type="date"
              value={values.date}
              onChange={(event) => setField("date", event.target.value)}
              required
              className="h-9"
              aria-invalid={Boolean(fieldErrors.date)}
            />
            <FieldError messages={fieldErrors.date} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-payment`}>Payment method</Label>
            <NativeSelect
              id={`${fieldId}-payment`}
              name="paymentMethod"
              value={values.paymentMethod}
              onChange={(event) =>
                setField("paymentMethod", event.target.value)
              }
              className="h-9"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-description`}>Description</Label>
            <Textarea
              id={`${fieldId}-description`}
              name="description"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Optional note"
              maxLength={200}
              rows={1}
              className="min-h-9 resize-none"
              aria-invalid={Boolean(fieldErrors.description)}
            />
            <FieldError messages={fieldErrors.description} />
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
            {isPending
              ? "Saving…"
              : transaction
                ? "Save changes"
                : "Add transaction"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  currency,
}: TransactionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {open ? (
          <TransactionForm
            transaction={transaction}
            categories={categories}
            currency={currency}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export type { TransactionFormValues };
