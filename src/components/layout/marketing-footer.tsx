import Link from "next/link";

const productLinks = [
  { href: "/model-list", label: "模型列表" },
  { href: "/pricing", label: "定价" },
  { href: "/faq", label: "FAQ" },
];

const docLinks = [
  { href: "/docs/quick-start", label: "快速开始" },
  { href: "/docs/api-reference", label: "API 参考" },
  { href: "/docs/sdk-examples", label: "SDK 示例" },
];

const aboutLinks = [
  { href: "/login", label: "登录" },
  { href: "/register", label: "注册" },
];

export function MarketingFooter() {
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
              统一 AI 模型网关平台，一个 API Key 访问所有主流 AI 模型。
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">产品</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">文档</h4>
            <ul className="space-y-2">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#1d1d1f]">关于</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#424245] transition-colors hover:text-[#1d1d1f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-black/[0.04] pt-6 text-center text-sm text-[#86868b]">
          &copy; 2025 Dezix AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
