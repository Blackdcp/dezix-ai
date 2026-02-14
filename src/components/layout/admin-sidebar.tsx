"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Box,
  Radio,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/models", label: "模型管理", icon: Box },
  { href: "/admin/channels", label: "渠道管理", icon: Radio },
  { href: "/admin/logs", label: "请求日志", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="text-lg font-bold">
          Dezix AI 管理
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
