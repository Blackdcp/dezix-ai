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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="gradient-brand flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="font-heading text-sm font-bold text-white">D</span>
          </div>
          <span className="font-heading text-lg font-bold text-[#0f1729]">
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
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#2563eb]"
                    : "text-[#3d4663] hover:text-[#0f1729] hover:bg-[#f0f2f5]"
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
          <Button
            variant="ghost"
            size="sm"
            className="text-[#3d4663] hover:text-[#0f1729] rounded-[10px]"
            asChild
          >
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Link
            href="/register"
            className="btn-primary inline-flex h-9 items-center justify-center px-5 text-sm font-medium"
          >
            {t("freeRegister")}
          </Link>
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-[10px]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">{t("mobileMenu")}</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#3d4663] transition-colors hover:bg-[#f0f2f5] hover:text-[#0f1729]"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="rounded-[10px]" asChild>
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Link
                  href="/register"
                  className="btn-primary inline-flex h-9 items-center justify-center text-sm font-medium"
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
