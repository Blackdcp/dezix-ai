import { type SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement>;

export function OpenAILogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

export function AnthropicLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.304 3.541h-3.48l6.157 16.918h3.48zm-10.609 0L.54 20.459H4.1l1.27-3.498h6.47l1.27 3.498h3.56L10.504 3.541zm.745 10.383L9.5 8.282l2.06 5.642z" />
    </svg>
  );
}

export function GoogleLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function DeepSeekLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-2.8L7.2 11.5l3.3-2.2V6.5L5 10.7v2.6l5.5 3.2zm3 0l5.5-3.2v-2.6L13.5 6.5v2.8l3.3 2.2-3.3 2.2v2.8z" />
    </svg>
  );
}

export function XAILogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3l7.586 9.471L3 21h1.72l6.632-7.466L16.5 21H21l-7.989-9.954L20.1 3h-1.72l-5.989 6.743L7.5 3H3zm2.42 1.2h2.688l10.47 15.6h-2.688L5.42 4.2z" />
    </svg>
  );
}

export function MiniMaxLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4h4v16H4zm6 4h4v12h-4zm6-4h4v16h-4z" />
    </svg>
  );
}

// Generic provider logo for Chinese providers (ByteDance, Aliyun, Zhipu, etc.)
export function GenericProviderLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.12 3.56L12 11.3 4.88 7.74 12 4.18zM4 8.96l7 3.5v7.58l-7-3.5V8.96zm9 11.08V12.46l7-3.5v7.58l-7 3.5z" />
    </svg>
  );
}

// Map provider names to their logo components and brand colors
export const providerConfig: Record<string, { Logo: (props: LogoProps) => React.ReactElement; color: string }> = {
  OpenAI: { Logo: OpenAILogo, color: "#10a37f" },
  Anthropic: { Logo: AnthropicLogo, color: "#d97757" },
  Google: { Logo: GoogleLogo, color: "#4285F4" },
  DeepSeek: { Logo: DeepSeekLogo, color: "#4D6BFE" },
  xAI: { Logo: XAILogo, color: "#000000" },
  MiniMax: { Logo: MiniMaxLogo, color: "#4F46E5" },
};

export function getProviderLogo(name: string) {
  return providerConfig[name] || { Logo: GenericProviderLogo, color: "#71717a" };
}
