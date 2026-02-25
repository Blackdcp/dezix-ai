import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const productLinks = [
  { href: "/model-list", labelKey: "modelList" },
  { href: "/pricing", labelKey: "pricing" },
  { href: "/faq", labelKey: "faq" },
];

const docLinks = [
  { href: "/docs/quick-start", labelKey: "quickStart" },
  { href: "/docs/api-reference", labelKey: "apiReference" },
  { href: "/docs/sdk-examples", labelKey: "sdkExamples" },
];

const aboutLinks = [
  { href: "/login", labelKey: "login" },
  { href: "/register", labelKey: "register" },
];

export function MarketingFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg">
                <span className="font-heading text-xs font-bold text-white">D</span>
              </div>
              <span className="font-heading text-lg font-bold text-[#0f1729]">
                Dezix AI
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#7c8299]">
              {t("Footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#0f1729]">
              {t("Footer.product")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7c8299] transition-colors hover:text-[#2563eb]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#0f1729]">
              {t("Footer.docs")}
            </h4>
            <ul className="space-y-3">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7c8299] transition-colors hover:text-[#2563eb]"
                  >
                    {t(`Footer.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#0f1729]">
              {t("Footer.about")}
            </h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7c8299] transition-colors hover:text-[#2563eb]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--border)] pt-8 text-center text-sm text-[#7c8299]">
          {t("Footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
