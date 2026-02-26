"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { useTranslations } from "next-intl";

export default function ApiReferencePage() {
  const t = useTranslations("ApiReference");

  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1C1917]">{t("title")}</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#57534E]">
        {t("subtitle")}
      </p>

      {/* Authentication */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("authTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#57534E]">
        {t("authText")}
      </p>
      <CodeBlock
        language="http"
        title={t("authHeader")}
        code={`Authorization: Bearer sk-dezix-your-api-key`}
      />

      {/* Base URL */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">Base URL</h2>
      <CodeBlock
        language="text"
        title="Base URL"
        code={`https://your-domain.com/api/v1`}
      />

      {/* Chat Completions */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">Chat Completions</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#57534E]">
        {t("chatCompletionsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#0070F3]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#0070F3]">POST /chat/completions</code>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">{t("requestParams")}</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-[#E7E5E0] bg-[#F9F8F6]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("param")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("type")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("required")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("paramDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">model</td>
              <td className="px-3 py-2 text-[#57534E]">string</td>
              <td className="px-3 py-2 text-[#57534E]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("modelDesc")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">messages</td>
              <td className="px-3 py-2 text-[#57534E]">array</td>
              <td className="px-3 py-2 text-[#57534E]">{t("yes")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("messagesDesc")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">stream</td>
              <td className="px-3 py-2 text-[#57534E]">boolean</td>
              <td className="px-3 py-2 text-[#57534E]">{t("no")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("streamDesc")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">temperature</td>
              <td className="px-3 py-2 text-[#57534E]">number</td>
              <td className="px-3 py-2 text-[#57534E]">{t("no")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("temperatureDesc")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">max_tokens</td>
              <td className="px-3 py-2 text-[#57534E]">integer</td>
              <td className="px-3 py-2 text-[#57534E]">{t("no")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("maxTokensDesc")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#0070F3]">top_p</td>
              <td className="px-3 py-2 text-[#57534E]">number</td>
              <td className="px-3 py-2 text-[#57534E]">{t("no")}</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("topPDesc")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">{t("requestExample")}</h3>
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

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">{t("responseExample")}</h3>
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("streamTitle")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#57534E]">
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">Models List</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#57534E]">
        {t("listModelsDesc")}
      </p>
      <div className="mb-4 rounded-lg bg-[#0070F3]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#0070F3]">GET /models</code>
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("errorCodes")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-[#E7E5E0] bg-[#F9F8F6]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("httpStatus")}</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#A8A29E]">{t("errorDesc")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">400</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error400")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">401</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error401")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">402</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error402")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">404</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error404")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">429</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error429")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">500</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error500")}</td>
            </tr>
            <tr className="border-b border-[#F5F3EF] hover:bg-[#F9F8F6]/50">
              <td className="px-3 py-2 font-mono text-[#0070F3]">502</td>
              <td className="px-3 py-2 text-[#A8A29E]">{t("error502")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
