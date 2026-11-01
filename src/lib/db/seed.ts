import type { PrismaClient } from "@/generated/prisma/client";
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD } from "@/lib/auth/demo";
import { hashPassword } from "@/lib/auth/password";
import { getMockData } from "@/lib/mock-data";
import { taskStatusToDb } from "@/lib/db/mappers";

/**
 * Seed the demo workspace.
 *
 * Every record comes from `getMockData()`, which is generated sample data. The
 * demo account is marked `isDemo`, and the UI labels it as sample data so it is
 * never mistaken for real user records.
 *
 * Returns true when a new demo user was created.
 */
export async function seedDemoWorkspace(prisma: PrismaClient): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  if (existing) return false;

  // Never inject a known-password account into a database that already has
  // real users.
  const userCount = await prisma.user.count();
  if (userCount > 0) return false;

  const data = getMockData();
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await prisma.user.create({
    data: {
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      passwordHash,
      isDemo: true,
      currency: "USD",
      timezone: "America/Los_Angeles",
      tasks: {
        create: data.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          status: taskStatusToDb(task.status),
          priority: task.priority,
          category: task.category,
          tags: task.tags,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
        })),
      },
      events: {
        create: data.events.map((event) => ({
          title: event.title,
          description: event.description,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: event.allDay,
          location: event.location ?? null,
          color: event.color,
        })),
      },
      transactions: {
        create: data.transactions.map((transaction) => ({
          type: transaction.type,
          amountCents: transaction.amountCents,
          category: transaction.category,
          description: transaction.description,
          date: new Date(transaction.date),
          paymentMethod: transaction.paymentMethod,
        })),
      },
      habits: {
        create: data.habits.map((habit) => ({
          name: habit.name,
          icon: habit.icon,
          frequency: habit.frequency,
          color: habit.color,
          completions: {
            create: habit.completions.map((dateKey) => ({ dateKey })),
          },
        })),
      },
      goals: {
        create: data.goals.map((goal) => ({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          current: goal.current,
          target: goal.target,
          unit: goal.unit,
          deadline: new Date(goal.deadline),
          status: goal.status,
        })),
      },
      notes: {
        create: data.notes.map((note) => ({
          title: note.title,
          content: note.excerpt,
          tags: note.tags,
          pinned: note.pinned,
          createdAt: new Date(note.updatedAt),
          updatedAt: new Date(note.updatedAt),
        })),
      },
      notifications: {
        create: data.notifications.map((notification) => ({
          dedupeKey: `seed:${notification.id}`,
          title: notification.title,
          description: notification.description,
          href: notification.href,
          kind: notification.kind,
          read: notification.read,
          createdAt: new Date(notification.createdAt),
        })),
      },
    },
  });

  return true;
}
