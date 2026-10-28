"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, SettingsIcon, XIcon } from "lucide-react";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isNavItemActive, navSections } from "@/lib/navigation";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  unreadCount: number;
  user: {
    fullName: string;
    email: string;
  };
}

export function MobileSidebar({ unreadCount, user }: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[286px] gap-0 bg-sidebar p-0"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-sidebar-border px-4 py-3.5">
          <SheetTitle className="sr-only">LifeHub navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Primary navigation for the LifeHub preview.
          </SheetDescription>
          <Brand />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <XIcon className="size-4" />
          </Button>
        </SheetHeader>

        <nav
          aria-label="Mobile primary"
          className="no-scrollbar flex-1 overflow-y-auto px-3 py-4"
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
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-primary/10"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                        {item.href === "/notifications" && unreadCount > 0 ? (
                          <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                            {unreadCount}
                          </span>
                        ) : item.phase ? (
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            P{item.phase}
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

        <div className="space-y-2 border-t border-sidebar-border p-3">
          <div className="flex items-center justify-between px-1.5 py-0.5">
            <span className="text-[12px] text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <SettingsIcon className="size-4" aria-hidden="true" />
            Settings
          </Link>
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-2.5 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium">{user.fullName}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
