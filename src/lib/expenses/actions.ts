"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { readField, toFieldErrors } from "@/lib/form-utils";

import {
  createTransaction,
  removeTransaction,
  updateTransaction,
} from "./repository";
import {
  transactionFormSchema,
  type ExpenseActionState,
  type TransactionFormValues,
} from "./schema";

function revalidateExpenseViews() {
  revalidatePath("/expenses");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function saveTransactionAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const user = await requireUser();

  const parsed = transactionFormSchema.safeParse({
    type: readField(formData, "type"),
    amount: readField(formData, "amount"),
    category: readField(formData, "category"),
    description: readField(formData, "description"),
    date: readField(formData, "date"),
    paymentMethod: readField(formData, "paymentMethod"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors<keyof TransactionFormValues>(parsed.error),
    };
  }

  const id = readField(formData, "id").trim();

  try {
    if (id) {
      const updated = await updateTransaction(user.id, id, parsed.data);
      if (!updated) {
        return {
          status: "error",
          message:
            "That transaction no longer exists. Refresh the page and try again.",
        };
      }
    } else {
      await createTransaction(user.id, parsed.data);
    }
  } catch (error) {
    console.error("[expenses] Failed to save transaction", error);
    return {
      status: "error",
      message:
        "The transaction could not be saved. Check the server log, then try again.",
    };
  }

  revalidateExpenseViews();
  return {
    status: "success",
    message: id ? "Transaction updated." : "Transaction added.",
  };
}

export async function deleteTransactionAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const user = await requireUser();
  const id = readField(formData, "id").trim();

  if (!id) return { status: "error", message: "Missing transaction id." };

  try {
    const removed = await removeTransaction(user.id, id);
    if (!removed) {
      return { status: "error", message: "That transaction was already removed." };
    }
  } catch (error) {
    console.error("[expenses] Failed to delete transaction", error);
    return {
      status: "error",
      message: "The transaction could not be deleted. Please try again.",
    };
  }

  revalidateExpenseViews();
  return { status: "success", message: "Transaction deleted." };
}
