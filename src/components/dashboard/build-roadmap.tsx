import { Code2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PHASES = [
  { number: 1, label: "Foundation & dashboard", status: "live" },
  { number: 2, label: "Tasks, forms & validation", status: "live" },
  { number: 3, label: "PostgreSQL, Prisma & seed data", status: "next" },
  { number: 4, label: "Authentication & data isolation", status: "planned" },
] as const;

export function BuildRoadmap() {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Building in the open
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            What is real today, and what comes next
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Phase 2
        </span>
      </div>

      <CardContent className="p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Tasks now create, edit, complete, and delete real records in a local
          JSON file. Money, habits, goals, events, and notes are still generated
          preview data — no figure here is a real financial record.
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-2.5 py-2">
          <Code2Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <code className="truncate font-mono text-[10px] text-muted-foreground">
            .data/tasks.json
          </code>
        </div>

        <ul className="mt-4 space-y-2.5">
          {PHASES.map((phase) => (
            <li key={phase.number} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold tabular-nums",
                  phase.status === "live"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : phase.status === "next"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {phase.number}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {phase.label}
              </span>
              {phase.status === "live" ? (
                <span className="ml-auto text-[9px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                  Live
                </span>
              ) : phase.status === "next" ? (
                <span className="ml-auto text-[9px] font-semibold tracking-wide text-primary uppercase">
                  Next
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-3 border-t pt-3 text-[10px] leading-relaxed text-muted-foreground">
          Each phase ends with lint, type-check and production build checks
          before the next one starts.
        </p>
      </CardContent>
    </Card>
  );
}
