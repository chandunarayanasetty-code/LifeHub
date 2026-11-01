import { addMonths, startOfDay } from "@/lib/date";
import type { FinancialTransaction, TransactionType } from "@/lib/types";

/**
 * URL-driven expense filters and money summaries. Pure functions so the page
 * stays a server component and the rules can be unit tested.
 */

export type TransactionTypeFilter = TransactionType | "all";

export interface ExpenseQuery {
  q: string;
  /** YYYY-MM */
  month: string;
  type: TransactionTypeFilter;
  category: string;
}

export interface ExpenseSummary {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  count: number;
}

export interface CategoryTotal {
  category: string;
  totalCents: number;
  share: number;
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function toMonthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyToDate(key: string): Date | null {
  if (!/^\d{4}-\d{2}$/.test(key)) return null;
  const [year, month] = key.split("-").map(Number);
  if (month < 1 || month > 12) return null;
  const date = new Date(year, month - 1, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function shiftMonthKey(key: string, amount: number): string {
  const date = monthKeyToDate(key);
  if (!date) return toMonthKey(new Date());
  return toMonthKey(addMonths(date, amount));
}

export function monthLabel(key: string): string {
  const date = monthKeyToDate(key);
  if (!date) return key;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export function parseExpenseQuery(
  searchParams: SearchParamsRecord,
  now = new Date(),
): ExpenseQuery {
  const monthValue = firstValue(searchParams.month);
  const typeValue = firstValue(searchParams.type);
  const categoryValue = firstValue(searchParams.category);

  return {
    q: firstValue(searchParams.q).slice(0, 120),
    month: monthKeyToDate(monthValue) ? monthValue : toMonthKey(now),
    type:
      typeValue === "income" || typeValue === "expense"
        ? typeValue
        : "all",
    category: categoryValue || "all",
  };
}

export function transactionMonthKey(transaction: FinancialTransaction): string {
  return toMonthKey(new Date(transaction.date));
}

export function matchesExpenseFilters(
  transaction: FinancialTransaction,
  query: ExpenseQuery,
): boolean {
  if (transactionMonthKey(transaction) !== query.month) return false;
  if (query.type !== "all" && transaction.type !== query.type) return false;
  if (query.category !== "all" && transaction.category !== query.category) {
    return false;
  }

  if (!query.q) return true;

  const haystack = [
    transaction.description,
    transaction.category,
    transaction.paymentMethod,
    transaction.type,
    (transaction.amountCents / 100).toFixed(2),
  ]
    .join(" ")
    .toLowerCase();

  return query.q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function summarizeTransactions(
  transactions: FinancialTransaction[],
): ExpenseSummary {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") incomeCents += transaction.amountCents;
    else expenseCents += transaction.amountCents;
  }

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
    count: transactions.length,
  };
}

export function expenseCategoryTotals(
  transactions: FinancialTransaction[],
): CategoryTotal[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + transaction.amountCents,
    );
  }

  const all = [...totals.values()].reduce((sum, value) => sum + value, 0);

  return [...totals.entries()]
    .map(([category, totalCents]) => ({
      category,
      totalCents,
      share: all > 0 ? totalCents / all : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export function monthRange(query: ExpenseQuery): { start: Date; end: Date } {
  const start = monthKeyToDate(query.month) ?? startOfDay(new Date());
  const end = addMonths(start, 1);
  return { start, end };
}

export function buildExpensesHref(
  query: ExpenseQuery,
  overrides: Partial<ExpenseQuery> = {},
): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (merged.month !== query.month) params.set("month", merged.month);
  if (merged.type !== "all") params.set("type", merged.type);
  if (merged.category !== "all") params.set("category", merged.category);
  if (merged.q) params.set("q", merged.q);

  const search = params.toString();
  return search ? `/expenses?${search}` : "/expenses";
}
