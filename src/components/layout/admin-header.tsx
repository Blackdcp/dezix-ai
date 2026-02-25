"use client";

import { Link } from "@/i18n/navigation";
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
import { ArrowLeft, LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const t = useTranslations("Header");

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="h-7 w-7 animate-pulse rounded-full bg-[#f4f4f5]" />
        <div className="h-4 w-16 animate-pulse rounded bg-[#f4f4f5]" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 rounded-xl hover:bg-[#f4f4f5]">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-[#7C5CFC]/10 text-xs font-medium text-[#7C5CFC]">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#52525b]">{user?.name || user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-[#e4e4e7] bg-white">
        <DropdownMenuItem className="rounded-lg">
          <User className="mr-2 h-4 w-4" />
          {t("personalSettings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-lg" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminHeader() {
  const t = useTranslations("Header");

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#e4e4e7] bg-white px-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#1a1a2e]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToConsole")}
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
