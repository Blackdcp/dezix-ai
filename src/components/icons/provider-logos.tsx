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
  Moonshot: "#1C1917",
  MiniMax: "#0060D0",
  Xiaomi: "#FF6900",
  Meituan: "#FFD100",
  StepFun: "#6366F1",
  OpenRouter: "#8B5CF6",
  Kling: "#000000",
  Vidu: "#6366F1",
};

/* ─── SVG path data (Simple Icons CC0 where available, geometric fallback otherwise) ─── */

function OpenAILogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.14-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855L13.1 8.364l2.02-1.166a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.306 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.5 4.5 0 0 1 7.376-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.098-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function AnthropicLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.304 3.541h-3.672l6.696 16.918H24zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.37 3.553h3.744L10.536 3.541zm-.371 10.223l2.291-5.946 2.292 5.946z" />
    </svg>
  );
}

function GoogleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
    </svg>
  );
}

function DeepSeekLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5c-.69.69-1.79.84-2.65.38l-2.1-1.15a.75.75 0 0 0-.7 0l-2.1 1.15c-.86.46-1.96.31-2.65-.38a2.02 2.02 0 0 1-.38-2.28L8.1 10.8a.75.75 0 0 0 0-.6L6.92 7.78A2.02 2.02 0 0 1 7.3 5.5c.69-.69 1.79-.84 2.65-.38l2.1 1.15a.75.75 0 0 0 .7 0l2.1-1.15c.86-.46 1.96-.31 2.65.38.69.69.84 1.79.38 2.28L15.9 10.2a.75.75 0 0 0 0 .6l1.18 2.42c.46.86.31 1.96-.38 2.28z" />
    </svg>
  );
}

function XAILogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2.3 2L10.1 12.9L2 22H3.8L10.9 14L16.7 22H22L13.8 10.6L21.4 2H19.6L13 9.4L7.6 2H2.3zM4.6 3.5H6.9L19.6 20.5H17.3L4.6 3.5z" />
    </svg>
  );
}

function ByteDanceLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.877 1.469L24 2.533v18.943l-4.123 1.056V1.469zm-13.348 9.428l4.115 1.064v8.979l-4.115 1.064v-11.107zM0 2.572l4.115 1.064v16.735L0 21.428V2.572zm17.455 5.621v11.107l-4.123-1.064V9.257l4.123-1.064z" />
    </svg>
  );
}

function AlibabaCloudLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.996 4.517h5.291L8.01 6.324 4.153 7.506a1.668 1.668 0 0 0-1.165 1.601v5.786a1.668 1.668 0 0 0 1.165 1.6l3.857 1.183 1.277 1.807H3.996A3.996 3.996 0 0 1 0 15.487V8.513a3.996 3.996 0 0 1 3.996-3.996m16.008 0h-5.291l1.277 1.807 3.857 1.182c.715.227 1.17.889 1.165 1.601v5.786a1.668 1.668 0 0 1-1.165 1.6l-3.857 1.183-1.277 1.807h5.291A3.996 3.996 0 0 0 24 15.487V8.513a3.996 3.996 0 0 0-3.996-3.996m-4.007 8.345H8.002v-1.804h7.995z" />
    </svg>
  );
}

function ZhipuLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="2" y="3" width="20" height="3.5" rx="1" />
      <rect x="6" y="9" width="12" height="3" rx="1" />
      <rect x="9" y="14.5" width="6" height="3" rx="1" />
      <rect x="10.5" y="20" width="3" height="2" rx="0.5" />
    </svg>
  );
}

function MoonshotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 0 16C8.5 20 5.8 16.5 7 12c.8-3 3-5.2 5-5.8A8 8 0 0 1 12 4z" />
      <circle cx="14" cy="10" r="2.5" />
    </svg>
  );
}

function MiniMaxLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2 6h4v12H2zm8-2h4v16h-4zm8 4h4v8h-4z" />
    </svg>
  );
}

function XiaomiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C8.016 0 4.756.255 2.493 2.516.23 4.776 0 8.033 0 12.012c0 3.98.23 7.235 2.494 9.497C4.757 23.77 8.017 24 12 24c3.983 0 7.243-.23 9.506-2.491C23.77 19.247 24 15.99 24 12.012c0-3.984-.233-7.243-2.502-9.504C19.234.252 15.978 0 12 0zM4.906 7.405h5.624c1.47 0 3.007.068 3.764.827.746.746.827 2.233.83 3.676v4.54a.15.15 0 0 1-.152.147h-1.947a.15.15 0 0 1-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15 0 0 0-.151.147v6.98a.15.15 0 0 1-.152.148H4.906a.15.15 0 0 1-.15-.148V7.554a.15.15 0 0 1 .15-.149zm12.131 0h1.949a.15.15 0 0 1 .15.15v8.892a.15.15 0 0 1-.15.148h-1.949a.15.15 0 0 1-.151-.148V7.554a.15.15 0 0 1 .151-.149zM8.92 10.948h2.046c.083 0 .15.066.15.147v5.352a.15.15 0 0 1-.15.148H8.92a.15.15 0 0 1-.152-.148v-5.352a.15.15 0 0 1 .152-.147z" />
    </svg>
  );
}

function MeituanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.923 0c-2.408 0-3.28.25-4.16.721A4.906 4.907 0 0 0 .722 2.763C.25 3.643 0 4.516 0 6.923v10.154c0 2.407.25 3.28.72 4.16a4.905 4.906 0 0 0 2.042 2.042c.88.47 1.752.721 4.16.721h10.156c2.407 0 3.28-.25 4.16-.721a4.906 4.907 0 0 0 2.04-2.042c.471-.88.722-1.753.722-4.16V6.923c0-2.407-.25-3.28-.722-4.16A4.906 4.907 0 0 0 21.238.72C20.357.251 19.484 0 17.077 0zM4.17 7.51h1.084c.04.24.07.488.11.737h3.47c.05-.25.08-.497.1-.736h1.105a9.849 9.85 0 0 1-.09.736h1.562v.866H7.62v.696h3.642v.855h-3.64v.667h3.64v.854h-3.64v.816h3.89v.865H7.88c.775.935 2.218 1.532 3.78 1.651l-.538.936c-1.442-.17-3.103-.846-4.028-2.04-.856 1.194-2.487 1.92-4.525 2.07l.318-1.005c1.382-.02 2.814-.736 3.431-1.612h-3.62v-.865h3.86v-.816h-3.64v-.854h3.64v-.667h-3.64v-.855h3.64v-.697H2.7v-.866h1.56zm8.603.182h7.976c.358 0 .567.198.567.547v8.146H13.33c-.358 0-.557-.199-.557-.547zm1.044.885V15.5h6.455V8.577zm3.999.476h1.024v.756h.975v.835h-.975V13c0 .806-.1 1.402-.318 2.02h-1.113c.338-.717.408-1.224.408-1.99v-2.387h-.935c-.14 1.541-.736 3.451-1.363 4.376h-1.134c.607-.855 1.303-2.526 1.472-4.376h-1.512v-.835h3.472z" />
    </svg>
  );
}

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

function KlingLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.36L19.64 8 12 11.64 4.36 8 12 4.36zM4 9.24l7 3.5v7.52l-7-3.5V9.24zm16 0v7.52l-7 3.5v-7.52l7-3.5z" />
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

const logoRegistry: Record<string, { Logo: (props: SVGProps<SVGSVGElement>) => React.JSX.Element; color: string }> = {
  OpenAI:    { Logo: OpenAILogo,        color: "#10a37f" },
  Anthropic: { Logo: AnthropicLogo,      color: "#d97757" },
  Google:    { Logo: GoogleLogo,         color: "#4285F4" },
  DeepSeek:  { Logo: DeepSeekLogo,       color: "#4D6BFE" },
  xAI:       { Logo: XAILogo,            color: "#000000" },
  ByteDance: { Logo: ByteDanceLogo,      color: "#3C8CFF" },
  Alibaba:   { Logo: AlibabaCloudLogo,   color: "#FF6A00" },
  Zhipu:     { Logo: ZhipuLogo,         color: "#0060D0" },
  Moonshot:  { Logo: MoonshotLogo,       color: "#1C1917" },
  MiniMax:   { Logo: MiniMaxLogo,        color: "#0060D0" },
  Xiaomi:    { Logo: XiaomiLogo,         color: "#FF6900" },
  Meituan:   { Logo: MeituanLogo,        color: "#FFD100" },
  StepFun:   { Logo: StepFunLogo,        color: "#6366F1" },
  OpenRouter:{ Logo: OpenRouterLogo,     color: "#8B5CF6" },
  Kling:     { Logo: KlingLogo,          color: "#000000" },
  Vidu:      { Logo: GenericLogo,         color: "#6366F1" },
};

/* ─── Public API ─── */

/** Render an inline SVG provider logo. Always crisp, no external files needed. */
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
