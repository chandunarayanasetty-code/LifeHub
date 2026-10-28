"use client";

import { useRouter } from "next/navigation";
import {
  BellIcon,
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
import { getInitials } from "@/lib/format";

interface UserMenuProps {
  user: {
    fullName: string;
    email: string;
  };
  unreadCount: number;
}

export function UserMenu({ user, unreadCount }: UserMenuProps) {
  const router = useRouter();

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
      <DropdownMenuContent align="end" className="w-56">
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
          onClick={() => router.push("/settings")}
          className="gap-2"
        >
          <UserRoundIcon className="size-4" />
          Profile
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
        <DropdownMenuItem disabled className="gap-2">
          <LogOutIcon className="size-4" />
          Sign out
          <DropdownMenuShortcut>Phase 4</DropdownMenuShortcut>
        </DropdownMenuItem>
        <p className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
          Authentication is not connected yet. This is a preview account.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
