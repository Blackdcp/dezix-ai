"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import type { Components } from "react-markdown";
import { useTranslations } from "next-intl";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const t = useTranslations("Common");

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      if (match) {
        const blockId = `block-${codeString.slice(0, 20)}`;
        return (
          <div className="group relative my-3">
            <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
              <span>{match[1]}</span>
              <button
                onClick={() => handleCopy(codeString, blockId)}
                className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {copiedBlock === blockId ? (
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
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                fontSize: "0.85rem",
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 text-sm"
          {...props}
        >
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="border-b bg-muted/50">{children}</thead>;
    },
    th({ children }) {
      return (
        <th className="px-3 py-2 text-left font-medium">{children}</th>
      );
    },
    td({ children }) {
      return <td className="border-b px-3 py-2">{children}</td>;
    },
    ul({ children }) {
      return <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="my-3 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      );
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {children}
        </a>
      );
    },
    p({ children }) {
      return <p className="my-2 leading-7">{children}</p>;
    },
    h1({ children }) {
      return <h1 className="mb-3 mt-6 text-2xl font-bold">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="mb-2 mt-5 text-xl font-bold">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>;
    },
    hr() {
      return <hr className="my-4 border-muted" />;
    },
  };

  return (
    <div className="prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
