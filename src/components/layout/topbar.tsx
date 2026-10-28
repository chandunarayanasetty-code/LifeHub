"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, ChevronRightIcon } from "lucide-react";

import { GlobalSearch } from "@/components/layout/global-search";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { QuickAdd } from "@/components/layout/quick-add";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { pageTitles } from "@/lib/navigation";
import type { SearchItem } from "@/lib/search";
import { cn } from "@/lib/utils";

interface TopbarProps {
  searchItems: SearchItem[];
  unreadCount: number;
  user: {
    fullName: string;
    email: string;
  };
}

export function Topbar({ searchItems, unreadCount, user }: TopbarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "LifeHub";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/80 bg-background/80 px-3 backdrop-blur-xl sm:px-5 lg:px-7">
      <MobileSidebar unreadCount={unreadCount} user={user} />

      <nav
        aria-label="Breadcrumb"
        className="mr-auto flex min-w-0 items-center gap-1 text-[13px]"
      >
        <span className="hidden text-muted-foreground sm:inline">LifeHub</span>
        <ChevronRightIcon
          className="hidden size-3.5 text-muted-foreground/60 sm:block"
          aria-hidden="true"
        />
        <span className="truncate font-medium" aria-current="page">
          {title}
        </span>
      </nav>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <GlobalSearch items={searchItems} />
        <QuickAdd />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "relative size-9 text-muted-foreground hover:text-foreground",
          )}
        >
          <BellIcon className="size-4.5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <UserMenu user={user} unreadCount={unreadCount} />
      </div>
    </header>
  );
}
