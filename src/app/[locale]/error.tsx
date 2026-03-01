"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorBoundary");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gradient-brand">Oops</p>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary inline-flex h-10 items-center justify-center px-6 text-sm font-medium"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-[#F5F3EF]"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
