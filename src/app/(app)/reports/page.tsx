import type { Metadata } from "next";
import { BarChart3Icon } from "lucide-react";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Accurate, date-filtered analytics across tasks, habits, money, and goals."
      phase={6}
      icon={BarChart3Icon}
      features={[
        "Task completion statistics and productivity trends",
        "Daily and weekly habit completion rates",
        "Monthly expense summaries and category breakdowns",
        "Budget-versus-actual spending comparisons",
        "Goal completion progress over a selected date range",
        "CSV exports with safe zero-division handling",
      ]}
    />
  );
}
