import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Brand />
      <span className="mt-10 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <CompassIcon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        404 · Not found
      </p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tight">
        This page is not on the map
      </h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        The address may be mistyped, or the module may not have shipped yet.
        Your dashboard is one click away.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "sm" }), "mt-6 h-9 px-3")}
      >
        Return to dashboard
      </Link>
    </main>
  );
}
