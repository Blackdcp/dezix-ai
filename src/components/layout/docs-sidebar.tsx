"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BookOpen, FileCode, Terminal } from "lucide-react";

const docNavItems = [
  {
    titleKey: "gettingStarted",
    items: [
      { href: "/docs/quick-start", labelKey: "quickStart", icon: BookOpen },
    ],
  },
  {
    titleKey: "reference",
    items: [
      { href: "/docs/api-reference", labelKey: "apiReference", icon: FileCode },
      { href: "/docs/sdk-examples", labelKey: "sdkExamples", icon: Terminal },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const t = useTranslations("DocsSidebar");

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-white lg:block">
      <nav className="sticky top-16 p-4">
        {docNavItems.map((group) => (
          <div key={group.titleKey} className="mb-6">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7c8299]">
              {t(group.titleKey)}
            </h4>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#2563eb]/10 text-[#2563eb]"
                          : "text-[#3d4663] hover:bg-[#f0f2f5] hover:text-[#0f1729]"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
