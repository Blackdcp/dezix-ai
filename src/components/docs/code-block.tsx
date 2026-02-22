"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Common");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
        <span>{title || language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 transition-opacity hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              {t("copied")}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              {t("copy")}
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          fontSize: "0.85rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
