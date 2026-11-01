import { DatabaseIcon, ShieldCheckIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Honest summary of where the data lives and who can read it. Replaces the
 * earlier phase-tracking card now that every module is live.
 */
export function DataOwnershipCard({ isDemo }: { isDemo: boolean }) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Your data
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Stored in PostgreSQL, scoped to this account
          </p>
        </div>
        <ShieldCheckIcon
          className="size-4 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
      </div>

      <CardContent className="p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {isDemo
            ? "This demo workspace is seeded with generated sample records so every module can be explored. None of it is a real financial or personal record."
            : "Every record here is yours. Each query is filtered by your user ID, so another account can never read or change it."}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-2.5 py-2">
          <DatabaseIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <code className="truncate font-mono text-[10px] text-muted-foreground">
            PostgreSQL · Prisma · scrypt sessions
          </code>
        </div>

        <dl className="mt-4 space-y-2.5 text-[11px]">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Passwords</dt>
            <dd className="text-right font-medium">
              Hashed with scrypt, never stored in plain text
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Sessions</dt>
            <dd className="text-right font-medium">
              HTTP-only cookie, only a hash is kept in the database
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Isolation</dt>
            <dd className="text-right font-medium">
              Every read and write checks the owner
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Sample data</dt>
            <dd className="text-right font-medium">
              Demo account only, always labelled
            </dd>
          </div>
        </dl>

        <p className="mt-4 border-t pt-3 text-[10px] leading-relaxed text-muted-foreground">
          There is no third-party analytics or tracking in LifeHub. Your
          workspace is only visible to you after signing in.
        </p>
      </CardContent>
    </Card>
  );
}
