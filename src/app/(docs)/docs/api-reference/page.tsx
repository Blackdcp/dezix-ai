"use client";

import { CodeBlock } from "@/components/docs/code-block";

export default function ApiReferencePage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold">API 参考</h1>
      <p className="mb-8 text-muted-foreground">
        Dezix AI 的 API 完全兼容 OpenAI 格式，以下是完整接口文档。
      </p>

      {/* Authentication */}
      <h2 className="mb-3 mt-8 text-xl font-bold">认证</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        所有 API 请求需要在 HTTP Header 中携带 API Key 进行认证：
      </p>
      <CodeBlock
        language="http"
        title="认证 Header"
        code={`Authorization: Bearer sk-dezix-your-api-key`}
      />

      {/* Base URL */}
      <h2 className="mb-3 mt-8 text-xl font-bold">Base URL</h2>
      <CodeBlock
        language="text"
        title="Base URL"
        code={`https://your-domain.com/api/v1`}
      />

      {/* Chat Completions */}
      <h2 className="mb-3 mt-8 text-xl font-bold">Chat Completions</h2>
      <p className="mb-2 text-sm leading-7 text-muted-foreground">
        创建一个聊天补全请求。
      </p>
      <div className="mb-4 rounded-md bg-muted px-3 py-2">
        <code className="text-sm font-semibold">POST /chat/completions</code>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold">请求参数</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">参数</th>
              <th className="px-3 py-2 text-left font-medium">类型</th>
              <th className="px-3 py-2 text-left font-medium">必填</th>
              <th className="px-3 py-2 text-left font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">model</td>
              <td className="px-3 py-2">string</td>
              <td className="px-3 py-2">是</td>
              <td className="px-3 py-2">模型 ID，如 gpt-4o-mini</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">messages</td>
              <td className="px-3 py-2">array</td>
              <td className="px-3 py-2">是</td>
              <td className="px-3 py-2">消息列表，包含 role 和 content</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">stream</td>
              <td className="px-3 py-2">boolean</td>
              <td className="px-3 py-2">否</td>
              <td className="px-3 py-2">是否使用流式输出，默认 false</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">temperature</td>
              <td className="px-3 py-2">number</td>
              <td className="px-3 py-2">否</td>
              <td className="px-3 py-2">采样温度，0-2 之间，默认 1</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">max_tokens</td>
              <td className="px-3 py-2">integer</td>
              <td className="px-3 py-2">否</td>
              <td className="px-3 py-2">最大生成 Token 数</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono text-xs">top_p</td>
              <td className="px-3 py-2">number</td>
              <td className="px-3 py-2">否</td>
              <td className="px-3 py-2">核采样阈值，0-1 之间，默认 1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-lg font-semibold">请求示例</h3>
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

      <h3 className="mb-2 mt-6 text-lg font-semibold">响应示例</h3>
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
      <h2 className="mb-3 mt-8 text-xl font-bold">流式响应</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        设置 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">stream: true</code> 时，
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
      <h2 className="mb-3 mt-8 text-xl font-bold">Models List</h2>
      <p className="mb-2 text-sm leading-7 text-muted-foreground">
        获取可用模型列表。
      </p>
      <div className="mb-4 rounded-md bg-muted px-3 py-2">
        <code className="text-sm font-semibold">GET /models</code>
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
      <h2 className="mb-3 mt-8 text-xl font-bold">错误码</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">HTTP 状态码</th>
              <th className="px-3 py-2 text-left font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">400</td>
              <td className="px-3 py-2">请求参数错误（缺少 model 或 messages）</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">401</td>
              <td className="px-3 py-2">API Key 无效或缺失</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">402</td>
              <td className="px-3 py-2">余额不足</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">404</td>
              <td className="px-3 py-2">模型不存在或未启用</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">429</td>
              <td className="px-3 py-2">请求频率超限</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">500</td>
              <td className="px-3 py-2">服务器内部错误</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-mono">502</td>
              <td className="px-3 py-2">上游供应商请求失败</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
