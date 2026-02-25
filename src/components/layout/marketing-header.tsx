"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/model-list", labelKey: "modelList" },
  { href: "/pricing", labelKey: "pricing" },
  { href: "/docs/quick-start", labelKey: "docs" },
  { href: "/faq", labelKey: "faq" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4e4e7] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="gradient-brand flex h-8 w-8 items-center justify-center rounded-xl">
            <span className="font-heading text-sm font-bold text-white">D</span>
          </div>
          <span className="font-heading text-lg font-bold text-[#1a1a2e]">
            Dezix AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#7C5CFC]"
                    : "text-[#52525b] hover:text-[#1a1a2e] hover:bg-[#f4f4f5]"
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#52525b] transition-colors hover:text-[#1a1a2e]"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="btn-primary inline-flex h-10 items-center justify-center px-6 text-sm"
          >
            {t("freeRegister")}
          </Link>
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white">
            <SheetTitle className="sr-only">{t("mobileMenu")}</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#52525b] transition-colors hover:bg-[#f4f4f5] hover:text-[#1a1a2e]"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Link
                  href="/register"
                  className="btn-primary inline-flex h-10 items-center justify-center text-sm"
                >
                  {t("freeRegister")}
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
