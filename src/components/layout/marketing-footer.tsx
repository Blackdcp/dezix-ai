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
    <footer className="border-t border-black/[0.04] bg-[#f5f5f7]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-[#1d1d1f]">
              Dezix AI
            </Link>
            <p className="mt-2 text-sm text-[#86868b]">
              {t("Footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">{t("Footer.product")}</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">{t("Footer.docs")}</h4>
            <ul className="space-y-2">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {t(`Footer.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">{t("Footer.about")}</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {t(`Nav.${link.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-black/[0.04] pt-6 text-center text-sm text-[#86868b]">
          {t("Footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
