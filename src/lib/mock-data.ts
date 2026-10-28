import {
  addDays,
  addMonths,
  startOfDay,
  toDateKey,
} from "@/lib/date";
import type {
  ActivityItem,
  AppNotification,
  CalendarEvent,
  FinancialTransaction,
  Goal,
  Habit,
  Note,
  Task,
} from "@/lib/types";

/**
 * PHASE 1 PREVIEW DATA — not real user data.
 *
 * Everything here is generated relative to the current date so the dashboard
 * remains useful whenever it is opened. Phase 3 replaces this module with
 * Prisma queries scoped to the signed-in user.
 */

export const demoUser = {
  name: "Chandu",
  fullName: "Chandra Narayana",
  email: "chandu@example.com",
  workspace: "Personal workspace",
  currency: "USD",
  timezone: "America/Los_Angeles",
} as const;

export interface MockData {
  tasks: Task[];
  events: CalendarEvent[];
  transactions: FinancialTransaction[];
  habits: Habit[];
  goals: Goal[];
  notes: Note[];
  activity: ActivityItem[];
  notifications: AppNotification[];
}

function at(now: Date, dayOffset: number, hour: number, minute = 0): string {
  const date = addDays(startOfDay(now), dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function monthDate(now: Date, monthOffset: number, day: number): string {
  const date = addMonths(startOfDay(now), monthOffset);
  date.setDate(1);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  date.setDate(Math.min(day, lastDay));
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function buildTasks(now: Date): Task[] {
  const activeTasks: Task[] = [
    {
      id: "task-01",
      title: "Finish quarterly budget review",
      description:
        "Reconcile the last three months and prepare a one-page summary for the family budget.",
      status: "in-progress",
      priority: "high",
      category: "Finance",
      tags: ["budget", "review"],
      dueDate: at(now, 0, 17),
      createdAt: at(now, -4, 9),
    },
    {
      id: "task-02",
      title: "Book dentist appointment",
      description: "Call the clinic and confirm a cleaning for next week.",
      status: "todo",
      priority: "medium",
      category: "Health",
      tags: ["appointment"],
      dueDate: at(now, 0, 12),
      createdAt: at(now, -1, 8),
    },
    {
      id: "task-03",
      title: "Review pull request #128",
      description: "Check the new dashboard components and leave review notes.",
      status: "todo",
      priority: "high",
      category: "Work",
      tags: ["code-review"],
      dueDate: at(now, 0, 18),
      createdAt: at(now, -2, 14),
    },
    {
      id: "task-04",
      title: "Pay electricity bill",
      description: "Avoid the late fee by paying before the weekend.",
      status: "todo",
      priority: "critical",
      category: "Bills",
      tags: ["utilities", "overdue"],
      dueDate: at(now, -2, 9),
      createdAt: at(now, -9, 10),
    },
    {
      id: "task-05",
      title: "Draft LifeHub project brief",
      description:
        "Capture the problem statement, target user, and Phase 1 scope.",
      status: "in-progress",
      priority: "medium",
      category: "Projects",
      tags: ["lifehub", "writing"],
      dueDate: at(now, 1, 15),
      createdAt: at(now, -3, 11),
    },
    {
      id: "task-06",
      title: "Plan weekend hiking trip",
      description: "Pick a trail, check the weather, and pack the essentials.",
      status: "todo",
      priority: "low",
      category: "Personal",
      tags: ["outdoors"],
      dueDate: at(now, 2, 18),
      createdAt: at(now, -5, 19),
    },
    {
      id: "task-07",
      title: "Renew library card",
      description: "The annual renewal is available online.",
      status: "todo",
      priority: "low",
      category: "Personal",
      tags: ["errand"],
      dueDate: at(now, 4, 12),
      createdAt: at(now, -6, 9),
    },
    {
      id: "task-08",
      title: "Update portfolio case study",
      description: "Add the final screenshots and outcomes section.",
      status: "cancelled",
      priority: "low",
      category: "Work",
      tags: ["portfolio"],
      dueDate: at(now, -3, 17),
      createdAt: at(now, -12, 13),
    },
  ];

  // Additional completed records give the charts realistic shape. In Phase 3
  // these come from the database instead of this generated list.
  const completedTitles = [
    ["Submit expense report", "Work"],
    ["Morning stretching routine", "Health"],
    ["Read 30 pages of Deep Work", "Learning"],
    ["Groceries for the week", "Personal"],
    ["Update savings transfer", "Finance"],
    ["Review weekly priorities", "Productivity"],
    ["Reply to landlord", "Personal"],
    ["Finish TypeScript chapter 4", "Learning"],
    ["Back up laptop photos", "Personal"],
    ["Clean inbox to zero", "Productivity"],
    ["Water the balcony plants", "Home"],
    ["Prepare meeting notes", "Work"],
    ["Walk 8,000 steps", "Health"],
    ["Plan meals for Monday", "Home"],
    ["Refactor task list component", "Work"],
    ["Read 20 pages", "Learning"],
    ["Meditate for 10 minutes", "Health"],
    ["Clear old downloads folder", "Home"],
    ["Send birthday message", "Personal"],
    ["Review monthly subscriptions", "Finance"],
    ["Practice Spanish lesson", "Learning"],
    ["Tidy desk", "Home"],
    ["Update project board", "Work"],
  ] as const;

  const completedTasks: Task[] = completedTitles.map(
    ([title, category], index) => {
      // 23 completions spread over the previous week (3-4 per day).
      const dayOffset = -((index % 7) + 1);
      return {
        id: `task-done-${index + 1}`,
        title,
        description: "Completed during the current preview week.",
        status: "completed",
        priority: index % 5 === 0 ? "high" : "medium",
        category,
        tags: [],
        dueDate: at(now, dayOffset, 18),
        createdAt: at(now, dayOffset - 3, 9),
        completedAt: at(now, dayOffset, 10 + (index % 7)),
      };
    },
  );

  // A handful from the previous week make the week-over-week delta meaningful.
  const previousWeekTasks: Task[] = completedTitles
    .slice(0, 15)
    .map(([title, category], index) => ({
      id: `task-prev-${index + 1}`,
      title,
      description: "Completed during the previous preview week.",
      status: "completed" as const,
      priority: "medium" as const,
      category,
      tags: [],
      dueDate: at(now, -8 - (index % 7), 18),
      createdAt: at(now, -12 - (index % 7), 9),
      completedAt: at(now, -8 - (index % 7), 11),
    }));

  return [...activeTasks, ...completedTasks, ...previousWeekTasks];
}

function buildEvents(now: Date): CalendarEvent[] {
  return [
    {
      id: "event-01",
      title: "Team planning session",
      description: "Map the next sprint and agree on priorities.",
      start: at(now, 0, 10),
      end: at(now, 0, 11),
      allDay: false,
      location: "Video call",
      color: "violet",
    },
    {
      id: "event-02",
      title: "Dentist appointment",
      description: "Routine cleaning and check-up.",
      start: at(now, 0, 15, 30),
      end: at(now, 0, 16, 15),
      allDay: false,
      location: "Northside Dental",
      color: "rose",
    },
    {
      id: "event-03",
      title: "LifeHub design review",
      description: "Review the dashboard hierarchy and mobile navigation.",
      start: at(now, 1, 9, 30),
      end: at(now, 1, 10, 30),
      allDay: false,
      location: "Studio",
      color: "emerald",
    },
    {
      id: "event-04",
      title: "Weekend hike",
      description: "Sunrise trail with a picnic lunch.",
      start: at(now, 3, 7),
      end: at(now, 3, 14),
      allDay: true,
      location: "Ridge Trail",
      color: "amber",
    },
    {
      id: "event-05",
      title: "Monthly budget review",
      description: "Compare actual spending with the plan.",
      start: at(now, 5, 18),
      end: at(now, 5, 19),
      allDay: false,
      location: "Home",
      color: "sky",
    },
  ];
}

function buildTransactions(now: Date): FinancialTransaction[] {
  const transactions: FinancialTransaction[] = [];

  for (let monthOffset = -5; monthOffset <= 0; monthOffset += 1) {
    const monthLabel = addMonths(now, monthOffset).getMonth();
    const variation = 1 + Math.sin(monthLabel * 1.7) * 0.08;

    transactions.push({
      id: `income-salary-${monthOffset}`,
      type: "income",
      amountCents: 540_000,
      category: "Salary",
      description: "Monthly salary",
      date: monthDate(now, monthOffset, 1),
      paymentMethod: "Bank transfer",
    });

    if (monthOffset === -3 || monthOffset === 0) {
      transactions.push({
        id: `income-freelance-${monthOffset}`,
        type: "income",
        amountCents: 85_000,
        category: "Freelance",
        description: "Design consulting",
        date: monthDate(now, monthOffset, 10),
        paymentMethod: "Bank transfer",
      });
    }

    const expenses = [
      ["Housing", "Apartment rent", 165_000, 3, "Bank transfer"],
      ["Food", "Groceries", 18_400, 6, "Card"],
      ["Food", "Groceries", 9_200, 14, "Card"],
      ["Food", "Dinner out", 8_900, 22, "Card"],
      ["Transport", "Fuel and transit", 6_200, 9, "Card"],
      ["Bills", "Electricity", 11_800, 12, "Bank transfer"],
      ["Bills", "Internet", 6_500, 15, "Card"],
      ["Health", "Gym membership", 4_500, 8, "Card"],
      ["Shopping", "Household supplies", 12_500, 19, "Card"],
      ["Entertainment", "Streaming services", 3_200, 24, "Card"],
    ] as const;

    for (const [category, description, amount, day, method] of expenses) {
      transactions.push({
        id: `expense-${monthOffset}-${category}-${day}-${description}`,
        type: "expense",
        amountCents: Math.round((amount * variation) / 100) * 100,
        category,
        description,
        date: monthDate(now, monthOffset, day),
        paymentMethod: method,
      });
    }
  }

  return transactions;
}

function lastNDays(now: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    toDateKey(addDays(startOfDay(now), -index)),
  );
}

function buildHabits(now: Date): Habit[] {
  const week = lastNDays(now, 7);
  const previousWeeks = lastNDays(now, 30);

  return [
    {
      id: "habit-01",
      name: "Morning run",
      icon: "activity",
      frequency: "daily",
      completions: week.filter((_, index) => index !== 2).concat(
        previousWeeks.slice(8, 20),
      ),
      color: "emerald",
    },
    {
      id: "habit-02",
      name: "Read 20 pages",
      icon: "book",
      frequency: "daily",
      completions: week.filter((_, index) => index !== 4).concat(
        previousWeeks.slice(9, 18),
      ),
      color: "amber",
    },
    {
      id: "habit-03",
      name: "Drink 2L water",
      icon: "droplets",
      frequency: "daily",
      completions: week.filter((_, index) => index !== 1).concat(
        previousWeeks.slice(7, 16),
      ),
      color: "sky",
    },
    {
      id: "habit-04",
      name: "Learn TypeScript",
      icon: "code",
      frequency: "daily",
      completions: week.filter((_, index) => index !== 5).concat(
        previousWeeks.slice(10, 19),
      ),
      color: "violet",
    },
    {
      id: "habit-05",
      name: "Meditate 10 min",
      icon: "brain",
      frequency: "daily",
      completions: week.filter((_, index) => index !== 0 && index !== 3).concat(
        previousWeeks.slice(11, 17),
      ),
      color: "rose",
    },
  ];
}

function buildGoals(now: Date): Goal[] {
  return [
    {
      id: "goal-01",
      title: "Build a 3-month emergency fund",
      description: "Keep six months of essential expenses accessible.",
      category: "Finance",
      current: 6_800,
      target: 10_000,
      unit: "USD",
      deadline: at(now, 75, 12),
      status: "active",
    },
    {
      id: "goal-02",
      title: "Read 12 books this year",
      description: "Mix fiction with design and engineering books.",
      category: "Learning",
      current: 5,
      target: 12,
      unit: "books",
      deadline: at(now, 120, 12),
      status: "active",
    },
    {
      id: "goal-03",
      title: "Ship LifeHub v1",
      description: "Complete all eight implementation phases and deploy.",
      category: "Projects",
      current: 3,
      target: 8,
      unit: "phases",
      deadline: at(now, 90, 12),
      status: "active",
    },
    {
      id: "goal-04",
      title: "Run 100 km this quarter",
      description: "Keep a steady weekly running routine.",
      category: "Health",
      current: 42,
      target: 100,
      unit: "km",
      deadline: at(now, 45, 12),
      status: "active",
    },
    {
      id: "goal-05",
      title: "Finish TypeScript fundamentals",
      description: "Complete the core chapters and build a small project.",
      category: "Learning",
      current: 10,
      target: 10,
      unit: "chapters",
      deadline: at(now, -10, 12),
      status: "completed",
    },
  ];
}

function buildNotes(now: Date): Note[] {
  return [
    {
      id: "note-01",
      title: "LifeHub architecture notes",
      excerpt:
        "Keep business logic out of components. Use server components for reads and server actions for mutations. Every query must be scoped to the signed-in user.",
      tags: ["engineering", "lifehub"],
      pinned: true,
      updatedAt: at(now, 0, 9, 20),
    },
    {
      id: "note-02",
      title: "Weekly review template",
      excerpt:
        "What moved forward? What stalled? What are the three priorities for next week? Which habits need attention?",
      tags: ["productivity", "template"],
      pinned: true,
      updatedAt: at(now, -1, 19, 10),
    },
    {
      id: "note-03",
      title: "Gift ideas for Mom",
      excerpt:
        "Ceramic planter, a good fountain pen, and the illustrated gardening book she mentioned.",
      tags: ["personal"],
      pinned: false,
      updatedAt: at(now, -3, 16, 40),
    },
    {
      id: "note-04",
      title: "Books to read next",
      excerpt:
        "Deep Work, The Design of Everyday Things, Refactoring UI, and The Pragmatic Programmer.",
      tags: ["reading", "learning"],
      pinned: false,
      updatedAt: at(now, -4, 8, 15),
    },
  ];
}

function buildActivity(now: Date): ActivityItem[] {
  return [
    {
      id: "activity-01",
      kind: "task",
      title: "Completed “Read 30 pages of Deep Work”",
      description: "Learning · +1 task this week",
      timestamp: at(now, 0, 8, 40),
    },
    {
      id: "activity-02",
      kind: "expense",
      title: "Recorded groceries — $64.20",
      description: "Food · Card payment",
      timestamp: at(now, 0, 7, 55),
    },
    {
      id: "activity-03",
      kind: "habit",
      title: "Morning run completed",
      description: "Habit streak extended to 4 days",
      timestamp: at(now, 0, 6, 30),
    },
    {
      id: "activity-04",
      kind: "note",
      title: "Updated “LifeHub architecture notes”",
      description: "Engineering · pinned note",
      timestamp: at(now, -1, 20, 10),
    },
    {
      id: "activity-05",
      kind: "goal",
      title: "Added $250 to emergency fund",
      description: "Goal progress now at 68%",
      timestamp: at(now, -1, 17, 0),
    },
  ];
}

function buildNotifications(now: Date): AppNotification[] {
  return [
    {
      id: "notification-01",
      title: "Task due today",
      description: "Finish quarterly budget review is due at 5:00 PM.",
      createdAt: at(now, 0, 8, 0),
      read: false,
      href: "/tasks",
      kind: "deadline",
    },
    {
      id: "notification-02",
      title: "Dentist appointment at 3:30 PM",
      description: "Northside Dental · 45 minute appointment.",
      createdAt: at(now, 0, 7, 30),
      read: false,
      href: "/calendar",
      kind: "event",
    },
    {
      id: "notification-03",
      title: "Goal deadline approaching",
      description: "Run 100 km this quarter is due in 45 days.",
      createdAt: at(now, -1, 18, 0),
      read: false,
      href: "/goals",
      kind: "goal",
    },
    {
      id: "notification-04",
      title: "Weekly habits summary",
      description: "You completed 29 of 35 habit check-ins this week.",
      createdAt: at(now, -2, 9, 0),
      read: true,
      href: "/habits",
      kind: "goal",
    },
  ];
}

export function getMockData(now = new Date()): MockData {
  return {
    tasks: buildTasks(now),
    events: buildEvents(now),
    transactions: buildTransactions(now),
    habits: buildHabits(now),
    goals: buildGoals(now),
    notes: buildNotes(now),
    activity: buildActivity(now),
    notifications: buildNotifications(now),
  };
}
