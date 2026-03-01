import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <html>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-4">
          <div className="pointer-events-none fixed inset-0 dot-grid opacity-40" />
          <div className="relative text-center">
            <p className="text-[120px] font-bold leading-none tracking-tighter text-gradient-brand sm:text-[160px]">
              {t("errorCode")}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              {t("description")}
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="btn-primary inline-flex h-11 items-center justify-center px-8 text-sm font-medium"
              >
                {t("backHome")}
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
