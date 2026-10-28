import Link from "next/link";
import { ArrowRightIcon, TargetIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { clampPercent, formatCurrency, formatNumber, formatShortDate } from "@/lib/format";
import type { Goal } from "@/lib/types";

function goalValue(goal: Goal): string {
  if (goal.unit === "USD") {
    return `${formatCurrency(goal.current * 100, "USD", { compact: true })} of ${formatCurrency(goal.target * 100, "USD", { compact: true })}`;
  }
  return `${formatNumber(goal.current)} of ${goal.target} ${goal.unit}`;
}

export function GoalsCard({
  goals,
  now,
}: {
  goals: Goal[];
  now: Date;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Active goals
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Progress toward what matters
          </p>
        </div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All goals
          <ArrowRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <CardContent className="p-4">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <TargetIcon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="text-[13px] font-medium">No active goals</p>
            <p className="max-w-[220px] text-[11px] text-muted-foreground">
              Goals you create will show their progress here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {goals.slice(0, 4).map((goal) => {
              const progress = clampPercent(goal.current, goal.target);
              const overdue = new Date(goal.deadline) < now;
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - now.getTime()) /
                  86_400_000,
              );

              return (
                <li key={goal.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium">
                        {goal.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {goal.category} ·{" "}
                        {overdue
                          ? `overdue by ${Math.abs(daysLeft)} days`
                          : `${daysLeft} days left · ${formatShortDate(goal.deadline)}`}
                      </p>
                    </div>
                    {overdue ? (
                      <Badge
                        variant="outline"
                        className="h-5 shrink-0 border-rose-500/20 bg-rose-500/10 px-1.5 text-[10px] text-rose-700 dark:text-rose-400"
                      >
                        Overdue
                      </Badge>
                    ) : (
                      <span className="shrink-0 text-[11px] font-semibold tabular-nums">
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    aria-label={`${goal.title} progress`}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{goalValue(goal)}</span>
                    {overdue ? (
                      <span className="tabular-nums">
                        {Math.round(progress)}%
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
