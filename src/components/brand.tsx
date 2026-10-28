import Link from "next/link";
import { OrbitIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="LifeHub dashboard"
    >
      <span className="grid size-9 place-items-center rounded-[11px] bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/25 transition-transform group-hover:-rotate-3">
        <OrbitIcon className="size-5" strokeWidth={1.9} aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">
            LifeHub
          </span>
          <span className="mt-1 text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Personal OS
          </span>
        </span>
      )}
    </Link>
  );
}
