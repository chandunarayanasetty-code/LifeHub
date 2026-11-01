"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { changePasswordSchema } from "@/lib/auth/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroyCurrentSession,
  requireUser,
} from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import {
  readField,
  toFieldErrors,
  type FormActionState,
} from "@/lib/form-utils";

import { deleteAccountSchema, profileSchema } from "./schema";

function revalidateAccountViews() {
  revalidatePath("/", "layout");
  revalidatePath("/settings");
}

export async function updateProfileAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    name: readField(formData, "name"),
    currency: readField(formData, "currency"),
    timezone: readField(formData, "timezone"),
    weekStartsOn: readField(formData, "weekStartsOn"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    const prisma = await getDb();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        currency: parsed.data.currency,
        timezone: parsed.data.timezone,
        weekStartsOn: Number(parsed.data.weekStartsOn),
      },
    });
  } catch (error) {
    console.error("[settings] Failed to update profile", error);
    return {
      status: "error",
      message: "Your preferences could not be saved. Please try again.",
    };
  }

  revalidateAccountViews();
  return { status: "success", message: "Preferences saved." };
}

export async function changePasswordAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: readField(formData, "currentPassword"),
    newPassword: readField(formData, "newPassword"),
    confirmPassword: readField(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const prisma = await getDb();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record) {
    return { status: "error", message: "Your account could not be found." };
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    record.passwordHash,
  );
  if (!valid) {
    return {
      status: "error",
      message: "Your current password is incorrect.",
      fieldErrors: { currentPassword: ["Incorrect password."] },
    };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    // Sign out every other device, then re-issue the current session.
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await createSession(user.id);
  } catch (error) {
    console.error("[settings] Failed to change password", error);
    return {
      status: "error",
      message: "The password could not be changed. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Password changed. Other sessions were signed out.",
  };
}

export async function deleteAccountAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireUser();

  const parsed = deleteAccountSchema.safeParse({
    password: readField(formData, "password"),
    confirmation: readField(formData, "confirmation"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const prisma = await getDb();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record || !(await verifyPassword(parsed.data.password, record.passwordHash))) {
    return {
      status: "error",
      message: "Your password is incorrect.",
      fieldErrors: { password: ["Incorrect password."] },
    };
  }

  try {
    // Cascading foreign keys remove sessions, tasks, events, money, habits,
    // notes, goals, and notifications with the account.
    await prisma.user.delete({ where: { id: user.id } });
    await destroyCurrentSession();
  } catch (error) {
    console.error("[settings] Failed to delete account", error);
    return {
      status: "error",
      message: "The account could not be deleted. Please try again.",
    };
  }

  redirect("/register");
}

export async function signOutEverywhereAction(): Promise<void> {
  const user = await requireUser();
  const prisma = await getDb();
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await destroyCurrentSession();
  redirect("/login");
}
