"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, FileCode, Terminal } from "lucide-react";

const docNavItems = [
  {
    title: "入门",
    items: [
      { href: "/docs/quick-start", label: "快速开始", icon: BookOpen },
    ],
  },
  {
    title: "参考",
    items: [
      { href: "/docs/api-reference", label: "API 参考", icon: FileCode },
      { href: "/docs/sdk-examples", label: "SDK 示例", icon: Terminal },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-black/[0.06] bg-[#f5f5f7] lg:block">
      <nav className="sticky top-14 p-4">
        {docNavItems.map((group) => (
          <div key={group.title} className="mb-6">
            <h4 className="mb-2 text-xs font-semibold uppercase text-[#86868b]">
              {group.title}
            </h4>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#007AFF]/10 text-[#007AFF]"
                          : "text-[#424245] hover:bg-black/[0.03] hover:text-[#1d1d1f]"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
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
