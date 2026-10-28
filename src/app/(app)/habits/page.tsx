import type { Metadata } from "next";
import { FlameIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = {
  title: "Habits",
};

export default function HabitsPage() {
  return (
    <ModulePlaceholder
      title="Habits"
      description="Build small routines and see the compounding effect of showing up."
      phase={5}
      icon={FlameIcon}
      features={[
        "Create, edit, archive, and delete habits",
        "Daily or weekly frequency targets",
        "One completion per habit and date, enforced by the database",
        "Current streak and best streak calculations",
        "Weekly and monthly completion rates",
        "Activity heatmap with timezone-consistent day keys",
      ]}
    />
  );
}
