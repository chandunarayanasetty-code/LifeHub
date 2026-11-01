"use server";

import { redirect } from "next/navigation";

import type { AuthActionState } from "./action-types";
import { hashPassword, verifyPassword } from "./password";
import {
  createSession,
  destroyCurrentSession,
  safeRedirectPath,
} from "./session";
import { loginSchema, registerSchema } from "./validation";
import { getDb } from "@/lib/db/client";
import { readField, toFieldErrors } from "@/lib/form-utils";

/**
 * Authentication server actions.
 *
 * Errors are returned as serialisable state for `useActionState`; passwords are
 * never echoed back, and invalid credentials always produce the same message so
 * the form does not reveal whether an email is registered.
 */

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: readField(formData, "email"),
    password: readField(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const prisma = await getDb();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });

  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
    };
  }

  await createSession(user.id);
  redirect(safeRedirectPath(readField(formData, "next")));
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    password: readField(formData, "password"),
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
  const passwordHash = await hashPassword(parsed.data.password);

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "An account with that email already exists.",
        fieldErrors: { email: ["This email is already registered."] },
      };
    }
    console.error("[auth] Failed to create account", error);
    return {
      status: "error",
      message: "The account could not be created. Please try again.",
    };
  }

  await createSession(userId);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/login");
}
