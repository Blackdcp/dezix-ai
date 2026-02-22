"use client";

import { CodeBlock } from "@/components/docs/code-block";

export default function ApiReferencePage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1d1d1f]">API 参考</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#424245]">
        Dezix AI 的 API 完全兼容 OpenAI 格式，以下是完整接口文档。
      </p>

      {/* Authentication */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">认证</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
        所有 API 请求需要在 HTTP Header 中携带 API Key 进行认证：
      </p>
      <CodeBlock
        language="http"
        title="认证 Header"
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
        创建一个聊天补全请求。
      </p>
      <div className="mb-4 rounded-lg bg-[#007AFF]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#007AFF]">POST /chat/completions</code>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">请求参数</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-black/[0.06] bg-[#f5f5f7]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">参数</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">类型</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">必填</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">model</td>
              <td className="px-3 py-2 text-[#424245]">string</td>
              <td className="px-3 py-2 text-[#424245]">是</td>
              <td className="px-3 py-2 text-[#86868b]">模型 ID，如 gpt-4o-mini</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">messages</td>
              <td className="px-3 py-2 text-[#424245]">array</td>
              <td className="px-3 py-2 text-[#424245]">是</td>
              <td className="px-3 py-2 text-[#86868b]">消息列表，包含 role 和 content</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">stream</td>
              <td className="px-3 py-2 text-[#424245]">boolean</td>
              <td className="px-3 py-2 text-[#424245]">否</td>
              <td className="px-3 py-2 text-[#86868b]">是否使用流式输出，默认 false</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">temperature</td>
              <td className="px-3 py-2 text-[#424245]">number</td>
              <td className="px-3 py-2 text-[#424245]">否</td>
              <td className="px-3 py-2 text-[#86868b]">采样温度，0-2 之间，默认 1</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">max_tokens</td>
              <td className="px-3 py-2 text-[#424245]">integer</td>
              <td className="px-3 py-2 text-[#424245]">否</td>
              <td className="px-3 py-2 text-[#86868b]">最大生成 Token 数</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-xs text-[#007AFF]">top_p</td>
              <td className="px-3 py-2 text-[#424245]">number</td>
              <td className="px-3 py-2 text-[#424245]">否</td>
              <td className="px-3 py-2 text-[#86868b]">核采样阈值，0-1 之间，默认 1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">请求示例</h3>
      <CodeBlock
        language="json"
        title="请求体"
        code={`{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "你是一个有帮助的助手。"},
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">响应示例</h3>
      <CodeBlock
        language="json"
        title="非流式响应"
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
        "content": "你好！有什么可以帮助你的吗？"
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">流式响应</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
        设置 <code className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-xs text-[#007AFF]">stream: true</code> 时，
        响应将以 SSE（Server-Sent Events）格式返回。每个事件包含一个 JSON 数据块：
      </p>
      <CodeBlock
        language="text"
        title="流式响应格式"
        code={`data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"你"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"好"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]`}
      />

      {/* Models List */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">Models List</h2>
      <p className="mb-2 text-[17px] leading-relaxed text-[#424245]">
        获取可用模型列表。
      </p>
      <div className="mb-4 rounded-lg bg-[#007AFF]/10 px-3 py-2">
        <code className="text-sm font-semibold text-[#007AFF]">GET /models</code>
      </div>
      <CodeBlock
        language="json"
        title="响应示例"
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
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">错误码</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-black/[0.06] bg-[#f5f5f7]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">HTTP 状态码</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider font-medium text-[#86868b]">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">400</td>
              <td className="px-3 py-2 text-[#86868b]">请求参数错误（缺少 model 或 messages）</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">401</td>
              <td className="px-3 py-2 text-[#86868b]">API Key 无效或缺失</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">402</td>
              <td className="px-3 py-2 text-[#86868b]">余额不足</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">404</td>
              <td className="px-3 py-2 text-[#86868b]">模型不存在或未启用</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">429</td>
              <td className="px-3 py-2 text-[#86868b]">请求频率超限</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">500</td>
              <td className="px-3 py-2 text-[#86868b]">服务器内部错误</td>
            </tr>
            <tr className="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50">
              <td className="px-3 py-2 font-mono text-[#007AFF]">502</td>
              <td className="px-3 py-2 text-[#86868b]">上游供应商请求失败</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
