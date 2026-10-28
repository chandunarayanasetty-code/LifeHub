import type { Metadata } from "next";
import { TargetIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = {
  title: "Goals",
};

export default function GoalsPage() {
  return (
    <ModulePlaceholder
      title="Goals"
      description="Turn intentions into measurable progress with targets, deadlines, and categories."
      phase={5}
      icon={TargetIcon}
      features={[
        "Create goals with descriptions and target values",
        "Track current progress against a validated target",
        "Categories, deadlines, and visual progress bars",
        "Overdue and archived goal views",
        "Mark goals complete without losing history",
        "Active goals surfaced on the dashboard",
      ]}
    />
  );
}
