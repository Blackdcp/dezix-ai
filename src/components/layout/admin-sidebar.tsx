"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Box,
  Radio,
  FileText,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/orders", labelKey: "orders", icon: CreditCard },
  { href: "/admin/models", labelKey: "models", icon: Box },
  { href: "/admin/channels", labelKey: "channels", icon: Radio },
  { href: "/admin/logs", labelKey: "logs", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("AdminNav");

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[#E7E5E0] bg-[#F9F8F6]">
      <div className="flex h-16 items-center gap-2 border-b border-[#E7E5E0] px-5">
        <Link href="/admin/dashboard" className="font-heading text-lg font-bold text-[#0070F3]">
          {t("title")}
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
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#EBF5FF] text-[#0070F3]"
                  : "text-[#57534E] hover:bg-[#F5F3EF] hover:text-[#1C1917]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
