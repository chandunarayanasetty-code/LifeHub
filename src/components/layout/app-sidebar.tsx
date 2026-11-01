"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon } from "lucide-react";

import { Brand } from "@/components/brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  isNavItemActive,
  navSections,
} from "@/lib/navigation";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  unreadCount: number;
  user: {
    fullName: string;
    email: string;
    isDemo?: boolean;
  };
}

export function AppSidebar({ unreadCount, user }: AppSidebarProps) {
  const pathname = usePathname();
  const settingsActive = isNavItemActive(pathname, "/settings");

  return (
    <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <div className="px-3">
        <div className="flex items-center justify-between rounded-xl border border-sidebar-border bg-card/60 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Workspace
            </p>
            <p className="truncate text-[13px] font-medium">Personal</p>
          </div>
          <Badge variant="secondary" className="h-5 text-[10px] font-medium">
            {user.isDemo ? "Sample" : "Live"}
          </Badge>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="no-scrollbar flex-1 overflow-y-auto px-3 py-5"
      >
        {navSections.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/80 uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, item.href);
                const showUnread =
                  item.href === "/notifications" && unreadCount > 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs ring-1 ring-primary/10"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                        strokeWidth={active ? 2.1 : 1.9}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                      {showUnread ? (
                        <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        <div className="rounded-xl border border-sidebar-border bg-muted/35 p-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium">
              {user.isDemo ? "Demo workspace" : "Your workspace"}
            </span>
            <span className="text-muted-foreground">8 modules</span>
          </div>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={8}
            aria-valuenow={8}
            aria-label="Modules available"
          >
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {user.isDemo
              ? "Sample records are clearly labelled and never mixed with real data."
              : "Everything here is saved in your account and scoped to you."}
          </p>
        </div>

        <Link
          href="/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
            settingsActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
          )}
        >
          <SettingsIcon className="size-4" aria-hidden="true" />
          Settings
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1.5 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent/50"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-medium">
              {user.fullName}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {user.email}
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
