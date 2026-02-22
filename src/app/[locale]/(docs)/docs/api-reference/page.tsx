"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { useTranslations } from "next-intl";

export default function ApiReferencePage() {
  const t = useTranslations("ApiReference");

  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1d1d1f]">{t("title")}</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#424245]">
        {t("subtitle")}
      </p>

      {/* Authentication */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">{t("authTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
        {t("authText")}
      </p>
      <CodeBlock
        language="http"
        title={t("authHeader")}
        code={`Authorization: Bearer sk-dezix-your-api-key`}
      />

      {/* Base URL */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">Base URL</h2>
      <CodeBlock
        language="text"
        title="Base URL"
        code={`https://your-domain.com/api/v1`}
      />

      {/* Chat Completions */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">Chat Completions</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#424245]">
        {t("chatCompletionsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#007AFF]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#007AFF]">POST /chat/completions</code>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">{t("requestParams")}</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-black/[0.06] bg-[#f5f5f7]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("param")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("type")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("required")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("paramDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">model</td>
              <td className="px-3 py-2 text-[#424245]">string</td>
              <td className="px-3 py-2 text-[#424245]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("modelDesc")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">messages</td>
              <td className="px-3 py-2 text-[#424245]">array</td>
              <td className="px-3 py-2 text-[#424245]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("messagesDesc")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">stream</td>
              <td className="px-3 py-2 text-[#424245]">boolean</td>
              <td className="px-3 py-2 text-[#424245]">{t("no")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("streamDesc")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">temperature</td>
              <td className="px-3 py-2 text-[#424245]">number</td>
              <td className="px-3 py-2 text-[#424245]">{t("no")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("temperatureDesc")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">max_tokens</td>
              <td className="px-3 py-2 text-[#424245]">integer</td>
              <td className="px-3 py-2 text-[#424245]">{t("no")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("maxTokensDesc")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">top_p</td>
              <td className="px-3 py-2 text-[#424245]">number</td>
              <td className="px-3 py-2 text-[#424245]">{t("no")}</td>
              <td className="px-3 py-2 text-[#86868b]">{t("topPDesc")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">{t("requestExample")}</h3>
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

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">{t("responseExample")}</h3>
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">{t("streamTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">Models List</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#424245]">
        {t("listModelsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#007AFF]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#007AFF]">GET /models</code>
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">{t("errorCodes")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-black/[0.06] bg-[#f5f5f7]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("httpStatus")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">{t("errorDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">400</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error400")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">401</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error401")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">402</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error402")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">404</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error404")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">429</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error429")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">500</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error500")}</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">502</td>
              <td className="px-3 py-2 text-[#86868b]">{t("error502")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
