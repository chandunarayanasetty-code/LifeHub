"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  LoaderCircleIcon,
  LogOutIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";
import { getInitials } from "@/lib/format";

interface UserMenuProps {
  user: {
    fullName: string;
    email: string;
    isDemo?: boolean;
  };
  unreadCount: number;
}

export function UserMenu({ user, unreadCount }: UserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function signOut() {
    startTransition(() => {
      void logoutAction();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Open profile menu"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-foreground">
              {user.fullName}
            </span>
            <span className="block truncate text-[10px] font-normal text-muted-foreground">
              {user.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/settings#account")}
          className="gap-2"
        >
          <UserRoundIcon className="size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="gap-2"
        >
          <SettingsIcon className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/notifications")}
          className="gap-2"
        >
          <BellIcon className="size-4" />
          Notifications
          {unreadCount > 0 ? (
            <DropdownMenuShortcut>{unreadCount}</DropdownMenuShortcut>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? (
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOutIcon className="size-4" aria-hidden="true" />
          )}
          {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
        {user.isDemo ? (
          <p className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
            Demo workspace with clearly labelled sample records.
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
