"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlusIcon,
  FlameIcon,
  ListPlusIcon,
  NotebookPenIcon,
  PlusIcon,
  TargetIcon,
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
    href: "/tasks",
    icon: ListPlusIcon,
    description: "Plan something to do",
  },
  {
    label: "New event",
    href: "/calendar",
    icon: CalendarPlusIcon,
    description: "Reserve time",
  },
  {
    label: "Add transaction",
    href: "/expenses",
    icon: WalletCardsIcon,
    description: "Track money in or out",
  },
  {
    label: "New habit",
    href: "/habits",
    icon: FlameIcon,
    description: "Start a routine",
  },
  {
    label: "New note",
    href: "/notes",
    icon: NotebookPenIcon,
    description: "Capture a thought",
  },
  {
    label: "New goal",
    href: "/goals",
    icon: TargetIcon,
    description: "Set a measurable target",
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
      <DropdownMenuContent align="end" className="w-64">
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
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
          Every item you create is saved to your own account.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
