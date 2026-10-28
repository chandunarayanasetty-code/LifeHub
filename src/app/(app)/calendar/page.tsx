import type { Metadata } from "next";
import { CalendarDaysIcon } from "lucide-react";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const params = await searchParams;

  return (
    <ModulePlaceholder
      title="Calendar"
      description="A single timeline for appointments, deadlines, and the shape of your week."
      phase={5}
      icon={CalendarDaysIcon}
      features={[
        "Monthly, weekly, and daily agenda views",
        "Create and edit events with start and end times",
        "All-day events and invalid-duration validation",
        "Task due dates displayed alongside calendar events",
        "Month and week navigation with timezone-safe dates",
        "Upcoming event list on the dashboard",
      ]}
      intentMessage={
        params.intent === "create"
          ? "You selected New event from Quick add. Event creation arrives in Phase 5, together with duration and timezone validation. Nothing was saved."
          : undefined
      }
    />
  );
}
