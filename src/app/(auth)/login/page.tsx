import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth/demo";
import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getSessionUser();
  if (user) redirect("/");

  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  // The demo account only exists in seeded local development.
  const prisma = await getDb();
  const demo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });

  return (
    <LoginForm
      next={next}
      demoCredentials={
        demo ? { email: DEMO_EMAIL, password: DEMO_PASSWORD } : null
      }
    />
  );
}
