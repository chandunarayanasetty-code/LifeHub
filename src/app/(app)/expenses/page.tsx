import type { Metadata } from "next";
import { WalletIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = {
  title: "Expenses",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;

  return (
    <ModulePlaceholder
      title="Expenses"
      description="Track income and spending, build monthly budgets, and understand where your money goes."
      phase={5}
      icon={WalletIcon}
      features={[
        "Record income and expenses with custom categories",
        "Precise money storage in integer minor units",
        "Monthly category budgets and savings calculations",
        "Income-versus-expense and category spending charts",
        "Search, filters, and monthly or yearly reports",
        "Per-user currency selection and CSV export",
      ]}
      intentMessage={
        params.intent === "create"
          ? "You selected Add expense from Quick add. Transaction forms and budget logic arrive in Phase 5. Nothing was saved."
          : undefined
      }
    />
  );
}
