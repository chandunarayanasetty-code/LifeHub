import { cache } from "react";

import { listEvents } from "@/lib/calendar/repository";
import { buildActivityFeed } from "@/lib/activity";
import { listTransactions } from "@/lib/expenses/repository";
import { listGoals } from "@/lib/goals/repository";
import { listHabits } from "@/lib/habits/repository";
import { listNotes } from "@/lib/notes/repository";
import { listTasks } from "@/lib/tasks/repository";
import type { ActivityItem } from "@/lib/types";

/**
 * Load a user's workspace once per request.
 *
 * React's `cache` deduplicates calls made by the layout and the page during the
 * same render, so the dashboard does not query the same tables twice.
 */
export const getWorkspaceData = cache(async (userId: string) => {
  const [tasks, events, transactions, habits, goals, notes] = await Promise.all([
    listTasks(userId),
    listEvents(userId),
    listTransactions(userId),
    listHabits(userId),
    listGoals(userId),
    listNotes(userId),
  ]);

  return { tasks, events, transactions, habits, goals, notes };
});

export async function getWorkspaceActivity(
  userId: string,
  limit = 6,
): Promise<ActivityItem[]> {
  const data = await getWorkspaceData(userId);
  return buildActivityFeed(data, limit);
}
