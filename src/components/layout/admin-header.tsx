"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
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

export function AdminHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回控制台
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{user?.name || user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            个人设置
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
