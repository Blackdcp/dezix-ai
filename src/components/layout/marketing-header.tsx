"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/model-list", label: "模型列表" },
  { href: "/pricing", label: "定价" },
  { href: "/docs/quick-start", label: "文档" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[#1d1d1f]">
          Dezix AI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#1d1d1f]"
                    : "text-[#424245] hover:text-[#1d1d1f]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="text-[#424245] hover:text-[#1d1d1f]" asChild>
            <Link href="/login">登录</Link>
          </Button>
          <Link
            href="/register"
            className="btn-primary inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium"
          >
            免费注册
          </Link>
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-[#424245] hover:text-[#1d1d1f]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">登录</Link>
                </Button>
                <Link
                  href="/register"
                  className="btn-primary inline-flex h-9 items-center justify-center rounded-full text-sm font-medium"
                >
                  免费注册
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
