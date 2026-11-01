import { describe, expect, it } from "vitest";

import {
  buildExpensesHref,
  expenseCategoryTotals,
  matchesExpenseFilters,
  monthKeyToDate,
  monthLabel,
  monthRange,
  parseExpenseQuery,
  shiftMonthKey,
  summarizeTransactions,
  toMonthKey,
  transactionMonthKey,
} from "@/lib/expenses/query";
import { makeTransaction } from "@/test/fixtures";

const now = new Date(2026, 5, 15); // June 2026.

describe("month keys", () => {
  it("formats and parses a month key", () => {
    expect(toMonthKey(new Date(2026, 0, 5))).toBe("2026-01");
    expect(toMonthKey(new Date(2026, 11, 5))).toBe("2026-12");
    expect(monthKeyToDate("2026-01")?.getMonth()).toBe(0);
  });

  it("rejects malformed months", () => {
    expect(monthKeyToDate("2026-13")).toBeNull();
    expect(monthKeyToDate("June")).toBeNull();
    expect(monthKeyToDate("2026-1")).toBeNull();
  });

  it("shifts across year boundaries", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
    expect(shiftMonthKey("2026-03", -14)).toBe("2025-01");
  });

  it("labels a month without shifting the month", () => {
    expect(monthLabel("2026-02")).toBe("February 2026");
  });
});

describe("parseExpenseQuery", () => {
  it("defaults to the current month and all filters", () => {
    expect(parseExpenseQuery({}, now)).toEqual({
      q: "",
      month: "2026-06",
      type: "all",
      category: "all",
    });
  });

  it("keeps a valid month and ignores an invalid one", () => {
    expect(parseExpenseQuery({ month: "2026-02" }, now).month).toBe("2026-02");
    expect(parseExpenseQuery({ month: "2026-99" }, now).month).toBe("2026-06");
  });

  it("only accepts known transaction types", () => {
    expect(parseExpenseQuery({ type: "income" }, now).type).toBe("income");
    expect(parseExpenseQuery({ type: "expense" }, now).type).toBe("expense");
    expect(parseExpenseQuery({ type: "transfer" }, now).type).toBe("all");
  });
});

describe("matchesExpenseFilters", () => {
  const june = parseExpenseQuery({ month: "2026-06" }, now);
  const may = parseExpenseQuery({ month: "2026-05" }, now);

  const groceries = makeTransaction({
    date: new Date(2026, 5, 2, 12).toISOString(),
    category: "Groceries",
    description: "Weekly shop",
    amountCents: 4250,
  });
  const salary = makeTransaction({
    id: "txn-2",
    type: "income",
    date: new Date(2026, 5, 1, 9).toISOString(),
    category: "Salary",
    description: "June salary",
    amountCents: 320_000,
  });
  const rent = makeTransaction({
    id: "txn-3",
    type: "expense",
    date: new Date(2026, 5, 3, 9).toISOString(),
    category: "Rent",
    description: "Monthly rent",
    amountCents: 120_000,
  });

  it("filters by month", () => {
    expect(matchesExpenseFilters(groceries, june)).toBe(true);
    expect(matchesExpenseFilters(groceries, may)).toBe(false);
  });

  it("filters by type and category", () => {
    const income = parseExpenseQuery({ month: "2026-06", type: "income" }, now);
    expect(matchesExpenseFilters(salary, income)).toBe(true);
    expect(matchesExpenseFilters(groceries, income)).toBe(false);

    const groceriesOnly = parseExpenseQuery(
      { month: "2026-06", category: "Groceries" },
      now,
    );
    expect(matchesExpenseFilters(groceries, groceriesOnly)).toBe(true);
    expect(matchesExpenseFilters(rent, groceriesOnly)).toBe(false);
  });

  it("searches description, category and the formatted amount", () => {
    const byDescription = parseExpenseQuery(
      { month: "2026-06", q: "weekly" },
      now,
    );
    expect(matchesExpenseFilters(groceries, byDescription)).toBe(true);
    expect(matchesExpenseFilters(rent, byDescription)).toBe(false);

    const byAmount = parseExpenseQuery({ month: "2026-06", q: "4250" }, now);
    expect(matchesExpenseFilters(groceries, byAmount)).toBe(false);
    // The haystack contains the human amount, 42.50, not raw cents.
    const byDecimal = parseExpenseQuery({ month: "2026-06", q: "42.50" }, now);
    expect(matchesExpenseFilters(groceries, byDecimal)).toBe(true);
  });
});

describe("summarizeTransactions", () => {
  const transactions = [
    makeTransaction({ type: "income", amountCents: 100_000 }),
    makeTransaction({ id: "e1", type: "expense", amountCents: 25_000 }),
    makeTransaction({ id: "e2", type: "expense", amountCents: 5_000 }),
  ];

  it("sums income and expenses in integer cents", () => {
    expect(summarizeTransactions(transactions)).toEqual({
      incomeCents: 100_000,
      expenseCents: 30_000,
      balanceCents: 70_000,
      count: 3,
    });
  });

  it("reports a negative balance when spending wins", () => {
    const summary = summarizeTransactions([
      makeTransaction({ type: "expense", amountCents: 10_000 }),
    ]);
    expect(summary.balanceCents).toBe(-10_000);
  });

  it("returns zeroes for no records", () => {
    expect(summarizeTransactions([])).toEqual({
      incomeCents: 0,
      expenseCents: 0,
      balanceCents: 0,
      count: 0,
    });
  });
});

describe("expenseCategoryTotals", () => {
  it("groups expenses, ignores income, and sorts by total", () => {
    const totals = expenseCategoryTotals([
      makeTransaction({ category: "Groceries", amountCents: 3_000 }),
      makeTransaction({ id: "b", category: "Rent", amountCents: 12_000 }),
      makeTransaction({ id: "c", category: "Groceries", amountCents: 2_000 }),
      makeTransaction({
        id: "d",
        type: "income",
        category: "Salary",
        amountCents: 90_000,
      }),
    ]);

    expect(totals).toEqual([
      { category: "Rent", totalCents: 12_000, share: 12_000 / 17_000 },
      { category: "Groceries", totalCents: 5_000, share: 5_000 / 17_000 },
    ]);
  });

  it("returns an empty list when there is no spending", () => {
    expect(expenseCategoryTotals([])).toEqual([]);
  });
});

describe("monthRange", () => {
  it("returns the inclusive start and exclusive end of a month", () => {
    const { start, end } = monthRange(parseExpenseQuery({ month: "2026-02" }, now));
    expect(start.getMonth()).toBe(1);
    expect(end.getMonth()).toBe(2);
    expect(transactionMonthKey(makeTransaction({ date: start.toISOString() }))).toBe(
      "2026-02",
    );
  });
});

describe("buildExpensesHref", () => {
  const base = parseExpenseQuery({ month: "2026-06" }, now);

  it("omits everything when the query is default", () => {
    expect(buildExpensesHref(base)).toBe("/expenses");
  });

  it("includes a changed month and filters", () => {
    expect(
      buildExpensesHref(base, { month: "2026-05", type: "expense", q: "rent" }),
    ).toBe("/expenses?month=2026-05&type=expense&q=rent");
  });
});
