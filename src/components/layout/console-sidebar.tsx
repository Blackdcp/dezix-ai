"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Store,
  MessageSquare,
  Settings,
  CreditCard,
  Bot,
  Gift,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/api-keys", labelKey: "apiKeys", icon: Key },
  { href: "/usage", labelKey: "usage", icon: BarChart3 },
  { href: "/models", labelKey: "models", icon: Store },
  { href: "/playground", labelKey: "playground", icon: MessageSquare },
  { href: "/chat", labelKey: "chat", icon: Bot },
  { href: "/billing", labelKey: "billing", icon: CreditCard },
  { href: "/referral", labelKey: "referral", icon: Gift },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const t = useTranslations("ConsoleNav");

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[#e4e4e7] bg-[#fafafa]">
      <div className="flex h-16 items-center gap-2.5 border-b border-[#e4e4e7] px-5">
        <div className="gradient-brand flex h-7 w-7 items-center justify-center rounded-xl">
          <span className="font-heading text-xs font-bold text-white">D</span>
        </div>
        <Link href="/dashboard" className="font-heading text-lg font-bold text-[#1a1a2e]">
          Dezix AI
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
                  ? "bg-[#f0ecff] text-[#7C5CFC]"
                  : "text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#1a1a2e]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <div className="border-t border-[#e4e4e7] p-3">
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              "text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#1a1a2e]"
            )}
          >
            <Shield className="h-4 w-4" />
            {t("adminPanel")}
          </Link>
        </div>
      )}
    </aside>
  );
}
