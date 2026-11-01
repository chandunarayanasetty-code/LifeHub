"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { readField } from "@/lib/form-utils";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./repository";

function revalidateNotificationViews() {
  revalidatePath("/notifications");
  revalidatePath("/");
}

export async function markNotificationReadAction(id: string): Promise<void> {
  if (!id) return;
  const user = await requireUser();
  await markNotificationRead(user.id, id).catch((error) => {
    console.error("[notifications] Failed to mark reminder read", error);
  });
  revalidateNotificationViews();
}

export async function markAllNotificationsReadAction(
  _previousState: { status: string },
  formData: FormData,
): Promise<{ status: string; message?: string }> {
  void _previousState;
  void formData;

  const user = await requireUser();

  try {
    const count = await markAllNotificationsRead(user.id);
    revalidateNotificationViews();
    return {
      status: "success",
      message:
        count === 0
          ? "Everything was already read."
          : `${count} reminder${count === 1 ? "" : "s"} marked as read.`,
    };
  } catch (error) {
    console.error("[notifications] Failed to mark all read", error);
    return {
      status: "error",
      message: "The reminders could not be updated. Please try again.",
    };
  }
}

/** Used by the reminder link: mark read, then let the link navigate. */
export async function openNotificationAction(formData: FormData): Promise<void> {
  const id = readField(formData, "id");
  if (!id) return;
  const user = await requireUser();
  await markNotificationRead(user.id, id).catch(() => undefined);
  revalidateNotificationViews();
}
