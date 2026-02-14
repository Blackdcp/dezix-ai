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
    <aside className="hidden w-56 shrink-0 border-r lg:block">
      <nav className="sticky top-14 p-4">
        {docNavItems.map((group) => (
          <div key={group.title} className="mb-6">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
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
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
