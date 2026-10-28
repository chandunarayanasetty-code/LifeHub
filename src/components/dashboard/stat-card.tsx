import type { LucideIcon } from "lucide-react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    label: string;
    tone: "positive" | "negative" | "neutral";
  };
  progress?: number;
  valueClassName?: string;
}

const TREND_STYLES = {
  positive:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  negative: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  neutral: "bg-muted text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  trend,
  progress,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className="gap-0 py-0 transition-shadow hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">
            {label}
          </p>
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p
            className={cn(
              "text-[26px] leading-none font-semibold tracking-tight tabular-nums",
              valueClassName,
            )}
          >
            {value}
          </p>
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                TREND_STYLES[trend.tone],
              )}
            >
              {trend.tone === "negative" ? (
                <ArrowDownRightIcon className="size-3" aria-hidden="true" />
              ) : trend.tone === "positive" ? (
                <ArrowUpRightIcon className="size-3" aria-hidden="true" />
              ) : null}
              {trend.label}
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
          {hint}
        </p>

        {typeof progress === "number" ? (
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={`${label} progress`}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
