import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterXIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import {
  DeleteTransactionButton,
  EditTransactionButton,
  NewTransactionButton,
} from "@/components/expenses/transaction-buttons";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { requireUser } from "@/lib/auth/session";
import {
  getTransactionCategories,
  listTransactions,
} from "@/lib/expenses/repository";
import {
  expenseCategoryTotals,
  matchesExpenseFilters,
  monthLabel,
  parseExpenseQuery,
  shiftMonthKey,
  summarizeTransactions,
  type ExpenseQuery,
} from "@/lib/expenses/query";
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/format";
import type { FinancialTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Expenses",
};

export const dynamic = "force-dynamic";

interface ExpensesPageProps {
  searchParams: Promise<{
    month?: string;
    type?: string;
    category?: string;
    q?: string;
    intent?: string;
  }>;
}

function monthHref(query: ExpenseQuery, month: string): string {
  const params = new URLSearchParams({ month });
  if (query.type !== "all") params.set("type", query.type);
  if (query.category !== "all") params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  return `/expenses?${params.toString()}`;
}

function groupByDate(
  transactions: FinancialTransaction[],
): Array<[string, FinancialTransaction[]]> {
  const groups = new Map<string, FinancialTransaction[]>();
  for (const transaction of transactions) {
    const key = new Date(transaction.date).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), transaction]);
  }
  return [...groups.entries()].sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
  );
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const query = parseExpenseQuery(params);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [transactions, categories] = await Promise.all([
    listTransactions(user.id),
    getTransactionCategories(user.id),
  ]);

  const filtered = transactions.filter((transaction) =>
    matchesExpenseFilters(transaction, query),
  );
  const summary = summarizeTransactions(filtered);
  const categoryTotals = expenseCategoryTotals(filtered);
  const grouped = groupByDate(filtered);

  const filtersActive =
    query.q !== "" || query.type !== "all" || query.category !== "all";

  const cleanParams = new URLSearchParams();
  if (query.month !== currentMonth) cleanParams.set("month", query.month);
  const cleanHref = cleanParams.toString()
    ? `/expenses?${cleanParams.toString()}`
    : "/expenses";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Money"
        title="Expenses"
        description="Track income and spending, see where the month went, and keep every amount in your account's own currency."
        actions={
          <NewTransactionButton
            categories={categories}
            currency={user.currency}
            autoOpen={params.intent === "create"}
            cleanHref={cleanHref}
          />
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Link
            href={monthHref(query, shiftMonthKey(query.month, -1))}
            aria-label="Previous month"
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={monthHref(query, shiftMonthKey(query.month, 1))}
            aria-label="Next month"
            className="grid size-8 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Link>
          <h2 className="ml-1.5 text-[16px] font-semibold tracking-tight">
            {monthLabel(query.month)}
          </h2>
          <Link
            href="/expenses"
            className="ml-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5"
          >
            This month
          </Link>
        </div>

        <Badge variant="outline" className="h-6 gap-1.5 px-2 text-[10px]">
          <ReceiptTextIcon className="size-3" aria-hidden="true" />
          {summary.count} {summary.count === 1 ? "record" : "records"} shown
        </Badge>
      </div>

      <section aria-label="Money summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Income"
          value={formatCurrency(summary.incomeCents, user.currency)}
          hint="Money received this month"
          icon={ArrowDownLeftIcon}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(summary.expenseCents, user.currency)}
          hint="Money spent this month"
          icon={ArrowUpRightIcon}
          iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label="Balance"
          value={formatCurrency(summary.balanceCents, user.currency, {
            signDisplay: "always",
          })}
          hint={
            summary.balanceCents >= 0
              ? "Income minus expenses"
              : "Spending is ahead of income"
          }
          icon={WalletIcon}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          valueClassName={
            summary.balanceCents < 0 ? "text-rose-600 dark:text-rose-400" : undefined
          }
        />
        <StatCard
          label="Largest category"
          value={categoryTotals[0]?.category ?? "—"}
          hint={
            categoryTotals[0]
              ? `${formatCurrency(categoryTotals[0].totalCents, user.currency)} · ${formatPercent(categoryTotals[0].share)} of spending`
              : "No spending recorded"
          }
          icon={TrendingUpIcon}
          iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </section>

      <Card className="gap-0 py-0">
        <CardContent className="p-3">
          <form
            action="/expenses"
            method="get"
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <input type="hidden" name="month" value={query.month} />

            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={query.q}
                placeholder="Search description or category"
                aria-label="Search transactions"
                maxLength={120}
                className="h-8 pl-8"
              />
            </div>

            <NativeSelect
              name="type"
              defaultValue={query.type}
              aria-label="Filter by type"
              className="h-8 sm:w-32"
            >
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </NativeSelect>

            <NativeSelect
              name="category"
              defaultValue={query.category}
              aria-label="Filter by category"
              className="h-8 sm:w-40"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </NativeSelect>

            <Button type="submit" variant="outline" size="sm" className="h-8 gap-1.5">
              Apply
            </Button>

            {filtersActive ? (
              <Link
                href={`/expenses?month=${query.month}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FilterXIcon className="size-3.5" aria-hidden="true" />
                Clear
              </Link>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Transactions
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {monthLabel(query.month)}
              </p>
            </div>
            <Link
              href="/expenses?intent=create"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Add
            </Link>
          </div>

          <CardContent className="p-0">
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                  <ReceiptTextIcon className="size-4.5" aria-hidden="true" />
                </span>
                <p className="text-[13px] font-medium">
                  {filtersActive ? "No matching transactions" : "No transactions yet"}
                </p>
                <p className="max-w-[260px] text-[11px] leading-relaxed text-muted-foreground">
                  {filtersActive
                    ? "Nothing in this month matches those filters. Clear them to see everything."
                    : "Add income or an expense and the summary above updates immediately."}
                </p>
                <Link
                  href="/expenses?intent=create"
                  className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                >
                  <PlusIcon className="size-3.5" aria-hidden="true" />
                  Add the first record
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {grouped.map(([dateKey, items]) => {
                  const dayTotal = items.reduce(
                    (total, item) =>
                      total +
                      (item.type === "income" ? item.amountCents : -item.amountCents),
                    0,
                  );
                  return (
                    <div key={dateKey}>
                      <div className="flex items-center justify-between gap-2 bg-muted/25 px-4 py-1.5">
                        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                          {formatShortDate(new Date(dateKey))}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-medium tabular-nums",
                            dayTotal >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatCurrency(dayTotal, user.currency, {
                            signDisplay: "always",
                          })}
                        </p>
                      </div>
                      <ul className="divide-y divide-border/50">
                        {items.map((transaction) => (
                          <li
                            key={transaction.id}
                            className="group flex items-center gap-3 px-4 py-2.5"
                          >
                            <span
                              className={cn(
                                "grid size-8 shrink-0 place-items-center rounded-lg",
                                transaction.type === "income"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                              )}
                            >
                              {transaction.type === "income" ? (
                                <ArrowDownLeftIcon className="size-4" aria-hidden="true" />
                              ) : (
                                <ArrowUpRightIcon className="size-4" aria-hidden="true" />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12.5px] font-medium">
                                {transaction.description || transaction.category}
                              </p>
                              <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                                {transaction.category} · {transaction.paymentMethod}
                              </p>
                            </div>

                            <p
                              className={cn(
                                "shrink-0 text-[12.5px] font-semibold tabular-nums",
                                transaction.type === "income"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground",
                              )}
                            >
                              {formatCurrency(
                                transaction.type === "income"
                                  ? transaction.amountCents
                                  : -transaction.amountCents,
                                user.currency,
                                { signDisplay: "always" },
                              )}
                            </p>

                            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <EditTransactionButton
                                transaction={transaction}
                                categories={categories}
                                currency={user.currency}
                              />
                              <DeleteTransactionButton transaction={transaction} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="border-b border-border/70 px-4 py-3.5">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Where it went
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Expense categories · {monthLabel(query.month)}
            </p>
          </div>
          <CardContent className="p-4">
            {categoryTotals.length === 0 ? (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                No expenses in this view yet. Add one to see the category
                breakdown.
              </p>
            ) : (
              <ul className="space-y-3">
                {categoryTotals.map((entry) => (
                  <li key={entry.category}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[11.5px] font-medium">
                        {entry.category}
                      </p>
                      <p className="shrink-0 text-[11px] font-medium tabular-nums">
                        {formatCurrency(entry.totalCents, user.currency)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(2, Math.round(entry.share * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-0.5 text-[9.5px] text-muted-foreground">
                      {formatPercent(entry.share)} of spending
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 border-t pt-3 text-[10px] leading-relaxed text-muted-foreground">
              All figures come from records you saved. Amounts are stored as
              integers and formatted as {user.currency}; nothing is estimated.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
