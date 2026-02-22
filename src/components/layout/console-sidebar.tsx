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
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-lg font-bold">
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <div className="border-t p-3">
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground"
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
