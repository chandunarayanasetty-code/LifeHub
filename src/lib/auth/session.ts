import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getDb } from "@/lib/db/client";
import { SESSION_COOKIE } from "@/lib/auth/cookies";

/**
 * Cookie-backed database sessions.
 *
 * The browser receives a random 256-bit token. Only its SHA-256 hash is stored,
 * so a leaked database dump cannot be replayed as a signed-in session. Sessions
 * expire after 30 days and are deleted on sign-out.
 */

export { SESSION_COOKIE };
export const SESSION_DURATION_DAYS = 30;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
  currency: string;
  timezone: string;
  weekStartsOn: number;
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  isDemo: true,
  currency: true,
  timezone: true,
  weekStartsOn: true,
} as const;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Read and validate the session cookie for the current request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const prisma = await getDb();
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, expiresAt: true, user: { select: USER_SELECT } },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {
      // A concurrent request may have removed it already.
    });
    return null;
  }

  return session.user;
});

/** Use in protected pages and server actions. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Create a session row and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const prisma = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  // Opportunistic cleanup keeps the table from growing without a cron job.
  await prisma.session
    .deleteMany({ where: { userId, expiresAt: { lte: new Date() } } })
    .catch(() => undefined);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Remove the current session row and clear the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const prisma = await getDb();
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined);
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** Only allow relative in-app paths as a post-login destination. */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
