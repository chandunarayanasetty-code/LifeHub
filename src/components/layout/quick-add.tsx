"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlusIcon,
  ListPlusIcon,
  NotebookPenIcon,
  PlusIcon,
  WalletCardsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIONS = [
  {
    label: "New task",
    phase: 2,
    href: "/tasks",
    icon: ListPlusIcon,
    description: "Plan something to do",
    available: true,
  },
  {
    label: "New note",
    phase: 5,
    href: "/notes",
    icon: NotebookPenIcon,
    description: "Capture a thought",
    available: false,
  },
  {
    label: "Add expense",
    phase: 5,
    href: "/expenses",
    icon: WalletCardsIcon,
    description: "Track money out",
    available: false,
  },
  {
    label: "New event",
    phase: 5,
    href: "/calendar",
    icon: CalendarPlusIcon,
    description: "Reserve time",
    available: false,
  },
] as const;

export function QuickAdd() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            className="h-9 gap-1.5 px-3 shadow-sm"
            aria-label="Quick add"
          />
        }
      >
        <PlusIcon className="size-4" />
        <span className="hidden sm:inline">Quick add</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onClick={() => router.push(`${action.href}?intent=create`)}
              className="gap-2.5 py-2"
            >
              <span className="grid size-7 place-items-center rounded-md bg-muted">
                <Icon className="size-3.5 text-muted-foreground" />
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-medium">{action.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {action.available ? (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Live
                  </span>
                ) : (
                  `P${action.phase}`
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
          Tasks save to this workspace. Other creation forms arrive in their
          module phase.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
