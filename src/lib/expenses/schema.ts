import { z } from "zod";

import type { FormActionState } from "@/lib/form-utils";
import type { TransactionType } from "@/lib/types";

/** Money validation and parsing shared by the form and server actions. */

export const TRANSACTION_TYPES = ["expense", "income"] as const;
export const PAYMENT_METHODS = [
  "Card",
  "Cash",
  "Bank transfer",
  "Direct debit",
  "Other",
] as const;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
};

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);

/**
 * Parse a user-entered amount ("1,234.56", "$18.40") into integer cents.
 * Returns null for zero, negative, malformed, or absurdly large values.
 */
export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, "");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(cleaned)) return null;

  const cents = Math.round(Number(cleaned) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  if (cents > 1_000_000_00) return null; // $1,000,000.00
  return cents;
}

export function centsToAmountInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getDate() === Number(value.slice(8, 10));
}

/** Local noon avoids a date shifting across time zones when stored as UTC. */
export function dateInputToDate(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function toDateInputValue(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const transactionFormSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .refine(
      (value) => parseAmountToCents(value) !== null,
      "Enter a positive amount with up to 2 decimals, like 42.50.",
    ),
  category: z
    .string()
    .trim()
    .min(1, "Choose or type a category.")
    .max(40, "Keep the category under 40 characters."),
  description: z
    .string()
    .trim()
    .max(200, "Keep the description under 200 characters."),
  date: z
    .string()
    .trim()
    .min(1, "Choose a date.")
    .refine(isValidDateInput, "Enter a valid date."),
  paymentMethod: z
    .string()
    .trim()
    .min(1, "Choose a payment method.")
    .max(40, "Keep the payment method under 40 characters."),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type ExpenseActionState = FormActionState;
export const initialExpenseActionState: ExpenseActionState = { status: "idle" };
