"use client";

import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const t = useTranslations("Header");

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user?.name || user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          {t("personalSettings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ConsoleHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
