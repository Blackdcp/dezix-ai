"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { useTranslations } from "next-intl";

export default function ApiReferencePage() {
  const t = useTranslations("ApiReference");

  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1a1a2e]">{t("title")}</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#52525b]">
        {t("subtitle")}
      </p>

      {/* Authentication */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">{t("authTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#52525b]">
        {t("authText")}
      </p>
      <CodeBlock
        language="http"
        title={t("authHeader")}
        code={`Authorization: Bearer sk-dezix-your-api-key`}
      />

      {/* Base URL */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">Base URL</h2>
      <CodeBlock
        language="text"
        title="Base URL"
        code={`https://your-domain.com/api/v1`}
      />

      {/* Chat Completions */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">Chat Completions</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#52525b]">
        {t("chatCompletionsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#7C5CFC]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#7C5CFC]">POST /chat/completions</code>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("requestParams")}</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-[#e4e4e7] bg-[#fafafa]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("param")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("type")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("required")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("paramDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">model</td>
              <td className="px-3 py-2 text-[#52525b]">string</td>
              <td className="px-3 py-2 text-[#52525b]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("modelDesc")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">messages</td>
              <td className="px-3 py-2 text-[#52525b]">array</td>
              <td className="px-3 py-2 text-[#52525b]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("messagesDesc")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">stream</td>
              <td className="px-3 py-2 text-[#52525b]">boolean</td>
              <td className="px-3 py-2 text-[#52525b]">{t("no")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("streamDesc")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">temperature</td>
              <td className="px-3 py-2 text-[#52525b]">number</td>
              <td className="px-3 py-2 text-[#52525b]">{t("no")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("temperatureDesc")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">max_tokens</td>
              <td className="px-3 py-2 text-[#52525b]">integer</td>
              <td className="px-3 py-2 text-[#52525b]">{t("no")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("maxTokensDesc")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#7C5CFC]">top_p</td>
              <td className="px-3 py-2 text-[#52525b]">number</td>
              <td className="px-3 py-2 text-[#52525b]">{t("no")}</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("topPDesc")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("requestExample")}</h3>
      <CodeBlock
        language="json"
        title={t("requestBody")}
        code={`{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("responseExample")}</h3>
      <CodeBlock
        language="json"
        title={t("nonStreamResponse")}
        code={`{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}`}
      />

      {/* Streaming */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">{t("streamTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#52525b]">
        {t("streamText")}
      </p>
      <CodeBlock
        language="text"
        title={t("streamFormat")}
        code={`data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]`}
      />

      {/* Models List */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">Models List</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#52525b]">
        {t("listModelsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#7C5CFC]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#7C5CFC]">GET /models</code>
      </div>
      <CodeBlock
        language="json"
        title={t("listModelsResponse")}
        code={`{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "owned_by": "openai"
    },
    {
      "id": "claude-3-5-sonnet-20241022",
      "object": "model",
      "owned_by": "anthropic"
    }
  ]
}`}
      />

      {/* Error Codes */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">{t("errorCodes")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-[#e4e4e7] bg-[#fafafa]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("httpStatus")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#a1a1aa]">{t("errorDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">400</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error400")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">401</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error401")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">402</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error402")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">404</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error404")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">429</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error429")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">500</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error500")}</td>
            </tr>
            <tr className="border-b border-[#f4f4f5] hover:bg-[#fafafa]/50">
              <td className="px-3 py-2 font-mono text-[#7C5CFC]">502</td>
              <td className="px-3 py-2 text-[#a1a1aa]">{t("error502")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
