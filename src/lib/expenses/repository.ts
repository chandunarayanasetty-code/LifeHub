import { getDb } from "@/lib/db/client";
import { toTransaction } from "@/lib/db/mappers";
import type { FinancialTransaction } from "@/lib/types";

import {
  dateInputToDate,
  parseAmountToCents,
  type TransactionFormValues,
} from "./schema";

/** Expense repository. Every query is scoped to the signed-in user. */

export async function listTransactions(
  userId: string,
): Promise<FinancialTransaction[]> {
  const prisma = await getDb();
  const records = await prisma.financialTransaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return records.map(toTransaction);
}

export async function getTransactionCategories(userId: string): Promise<string[]> {
  const prisma = await getDb();
  const records = await prisma.financialTransaction.findMany({
    where: { userId },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return records.map((record) => record.category);
}

function fieldsFromForm(values: TransactionFormValues) {
  const amountCents = parseAmountToCents(values.amount);
  if (amountCents === null) {
    throw new Error("Invalid amount passed validation");
  }

  return {
    type: values.type,
    amountCents,
    category: values.category,
    description: values.description,
    date: dateInputToDate(values.date),
    paymentMethod: values.paymentMethod,
  };
}

export async function createTransaction(
  userId: string,
  values: TransactionFormValues,
): Promise<FinancialTransaction> {
  const prisma = await getDb();
  const record = await prisma.financialTransaction.create({
    data: { userId, ...fieldsFromForm(values) },
  });
  return toTransaction(record);
}

export async function updateTransaction(
  userId: string,
  id: string,
  values: TransactionFormValues,
): Promise<FinancialTransaction | null> {
  const prisma = await getDb();
  const existing = await prisma.financialTransaction.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const record = await prisma.financialTransaction.update({
    where: { id: existing.id },
    data: fieldsFromForm(values),
  });
  return toTransaction(record);
}

export async function removeTransaction(
  userId: string,
  id: string,
): Promise<boolean> {
  const prisma = await getDb();
  const result = await prisma.financialTransaction.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}
