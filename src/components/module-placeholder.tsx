import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  InfoIcon,
  LockKeyholeIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  phase: number;
  icon: LucideIcon;
  features: string[];
  intentMessage?: string;
}

export function ModulePlaceholder({
  title,
  description,
  phase,
  icon: Icon,
  features,
  intentMessage,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Roadmap · Phase ${phase}`}
        title={title}
        description={description}
        actions={
          <Badge
            variant="outline"
            className="h-6 gap-1.5 border-amber-500/25 bg-amber-500/5 px-2 text-[10px] text-amber-700 dark:text-amber-400"
          >
            <LockKeyholeIcon className="size-3" aria-hidden="true" />
            Not built yet
          </Badge>
        }
      />

      {intentMessage ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-[12px] leading-relaxed"
        >
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>{intentMessage}</p>
        </div>
      ) : null}

      <Card className="gap-0 py-0">
        <CardContent className="p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[19px] font-semibold tracking-tight">
                This module is on the roadmap
              </h2>
              <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
                The navigation and page shell are ready, but the working
                feature is intentionally not connected yet. Nothing on this
                page pretends to save data.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-9 gap-1.5 px-3",
                  )}
                >
                  Back to dashboard
                  <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/settings"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-9 px-3",
                  )}
                >
                  View what works today
                </Link>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                  Planned for Phase {phase}. The data model, server validation,
                  ownership checks, and tests will ship together — not as a
                  visual-only mockup.
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/25 p-4 sm:p-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Planned capabilities
              </p>
              <ul className="mt-3 space-y-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[12px] leading-snug"
                  >
                    <CheckCircle2Icon
                      className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-lg border border-dashed bg-card/60 px-3 py-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium">Roadmap position</span>
                  <span className="text-muted-foreground">
                    Phase {phase} of 8 · planned
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-muted-foreground/30"
                    style={{ width: `${(phase / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
