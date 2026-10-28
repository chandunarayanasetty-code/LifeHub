"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log for the developer, but never render stack traces to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md gap-0 py-0">
        <CardContent className="p-6 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangleIcon className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[18px] font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
            This view could not be loaded. Your data has not been changed. Try
            again, or return to the dashboard.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              onClick={reset}
              className="h-9 gap-1.5 px-3"
            >
              <RotateCcwIcon className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 px-3",
              )}
            >
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
