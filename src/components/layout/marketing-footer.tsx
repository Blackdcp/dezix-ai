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
    <footer className="border-t border-[#E7E5E0] bg-[#F9F8F6]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-heading text-lg font-bold text-gradient-brand">
                Dezix AI
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#78716C]">
              {t("Footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#1C1917]">
              {t("Footer.product")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#78716C] transition-colors hover:text-[#0070F3]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#1C1917]">
              {t("Footer.docs")}
            </h4>
            <ul className="space-y-3">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#78716C] transition-colors hover:text-[#0070F3]"
                  >
                    {t(`Footer.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading mb-4 text-sm font-semibold text-[#1C1917]">
              {t("Footer.about")}
            </h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#78716C] transition-colors hover:text-[#0070F3]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#E7E5E0] pt-8 text-center text-sm text-[#A8A29E]">
          {t("Footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
