import { type SVGProps } from "react";

/* ─── Brand colors ─── */
const brandColors: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#4285F4",
  DeepSeek: "#4D6BFE",
  xAI: "#000000",
  ByteDance: "#3C8CFF",
  Alibaba: "#FF6A00",
  Zhipu: "#0060D0",
  Moonshot: "#6D28D9",
  MiniMax: "#0060D0",
  Xiaomi: "#FF6900",
  Meituan: "#FFD100",
  StepFun: "#6366F1",
  OpenRouter: "#8B5CF6",
  Kling: "#000000",
  Vidu: "#6366F1",
  Arcee: "#10b981",
  Qiniu: "#07B0F5",
};

/* ─── CDN logo URLs (Sufy/Qiniu static CDN — matches Sufy's model marketplace) ─── */
const LOGO_CDN_BASE = "https://static.qiniu.com/ai-inference/model-icons";

const cdnLogos: Record<string, string> = {
  OpenAI: `${LOGO_CDN_BASE}/openai.png`,
  Anthropic: `${LOGO_CDN_BASE}/anthropic.png`,
  Google: `${LOGO_CDN_BASE}/google.png`,
  DeepSeek: `${LOGO_CDN_BASE}/deepseek.png`,
  xAI: `${LOGO_CDN_BASE}/x.png`,
  ByteDance: `${LOGO_CDN_BASE}/doubao.png`,
  Alibaba: `${LOGO_CDN_BASE}/qwen.png`,
  Zhipu: `${LOGO_CDN_BASE}/z-icon.png`,
  Moonshot: `${LOGO_CDN_BASE}/kimi.png`,
  MiniMax: `${LOGO_CDN_BASE}/minimax.png`,
  Xiaomi: `${LOGO_CDN_BASE}/xiaomi.png`,
  Meituan: `${LOGO_CDN_BASE}/meituan.png`,
  Kling: `${LOGO_CDN_BASE}/kling.png`,
  Qiniu: `${LOGO_CDN_BASE}/qiniu.png`,
};

/* ─── CDN Image component factory ─── */
function makeCdnLogo(url: string, brandName: string) {
  return function CdnLogo(props: SVGProps<SVGSVGElement>) {
    const { className, ...rest } = props;
    void rest; // SVG-specific props ignored for <img>
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={brandName}
        className={className}
        style={{ objectFit: "contain" }}
        loading="lazy"
      />
    );
  };
}

/* ─── SVG fallbacks for providers without CDN logos ─── */

function StepFunLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 18V14h4v-4h4V6h4v4h4v4h4v4H4z" />
    </svg>
  );
}

function OpenRouterLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM7 17.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      <path d="M12 9.5l-3.5 4h2v3h3v-3h2z" opacity="0.6" />
    </svg>
  );
}

function GenericLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v2h2v2h-2v2h2v2h-2v2h-2v-2H9v-2h2v-2H9V9h2V7z" />
    </svg>
  );
}

/* ─── Registry: brand name → { Logo component, color } ─── */
// CDN-backed providers get img-based Logo, others get SVG
const logoRegistry: Record<string, { Logo: (props: SVGProps<SVGSVGElement>) => React.JSX.Element; color: string }> = {};

// Register CDN logos
for (const [name, url] of Object.entries(cdnLogos)) {
  logoRegistry[name] = {
    Logo: makeCdnLogo(url, name),
    color: brandColors[name] || "#8c8c9a",
  };
}

// Register SVG-only logos
logoRegistry.StepFun = { Logo: StepFunLogo, color: "#6366F1" };
logoRegistry.OpenRouter = { Logo: OpenRouterLogo, color: "#8B5CF6" };
logoRegistry.Vidu = { Logo: makeCdnLogo(`${LOGO_CDN_BASE}/community.png`, "Vidu"), color: "#6366F1" };
logoRegistry.Arcee = { Logo: GenericLogo, color: "#10b981" };

/* ─── Public API ─── */

/** Render an inline provider logo. CDN-backed providers use img, others use SVG. */
export function ProviderIcon({ name, className }: { name: string; className?: string }) {
  const entry = logoRegistry[name];
  if (entry) {
    return <entry.Logo className={className} style={{ color: entry.color }} />;
  }
  return <GenericLogo className={className} style={{ color: "#8c8c9a" }} />;
}

/** Get provider logo info. Use ProviderIcon component when possible. */
export function getProviderLogo(name: string): { color: string; Logo: (props: SVGProps<SVGSVGElement>) => React.JSX.Element } {
  return logoRegistry[name] || { Logo: GenericLogo, color: "#8c8c9a" };
}

/** Get brand color by name */
export function getBrandColor(name: string): string {
  return brandColors[name] || "#8c8c9a";
}
