"use client";

import { CodeBlock } from "@/components/docs/code-block";

export default function SdkExamplesPage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1d1d1f]">SDK 示例</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#424245]">
        使用各语言 SDK 快速接入 Dezix AI。由于完全兼容 OpenAI 格式，您可以直接使用 OpenAI 官方 SDK。
      </p>

      {/* Python */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1d1d1f]">Python</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
        安装 OpenAI Python SDK：
      </p>
      <CodeBlock language="bash" title="安装" code="pip install openai" />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">基本对话</h3>
      <CodeBlock
        language="python"
        title="basic_chat.py"
        code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-dezix-your-api-key",
    base_url="https://your-domain.com/api/v1"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一个有帮助的 AI 助手。"},
        {"role": "user", "content": "请用 Python 写一个快速排序算法"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">流式响应</h3>
      <CodeBlock
        language="python"
        title="streaming.py"
        code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-dezix-your-api-key",
    base_url="https://your-domain.com/api/v1"
)

stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "给我讲一个简短的故事"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">多轮对话</h3>
      <CodeBlock
        language="python"
        title="multi_turn.py"
        code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-dezix-your-api-key",
    base_url="https://your-domain.com/api/v1"
)

messages = [
    {"role": "system", "content": "你是一个专业的翻译助手。"}
]

# 第一轮
messages.append({"role": "user", "content": "请将以下文本翻译成英文：你好世界"})
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
assistant_msg = response.choices[0].message.content
messages.append({"role": "assistant", "content": assistant_msg})
print(f"助手: {assistant_msg}")

# 第二轮
messages.append({"role": "user", "content": "现在翻译成日文"})
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
print(f"助手: {response.choices[0].message.content}")`}
      />

      {/* Node.js */}
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1d1d1f]">Node.js</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#424245]">
        安装 OpenAI Node.js SDK：
      </p>
      <CodeBlock language="bash" title="安装" code="npm install openai" />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">基本对话</h3>
      <CodeBlock
        language="javascript"
        title="basic_chat.mjs"
        code={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-dezix-your-api-key",
  baseURL: "https://your-domain.com/api/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "你是一个有帮助的 AI 助手。" },
    { role: "user", content: "请用 JavaScript 写一个冒泡排序" },
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

console.log(response.choices[0].message.content);`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">流式响应</h3>
      <CodeBlock
        language="javascript"
        title="streaming.mjs"
        code={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-dezix-your-api-key",
  baseURL: "https://your-domain.com/api/v1",
});

const stream = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "user", content: "给我讲一个简短的故事" },
  ],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
console.log();`}
      />

      {/* cURL */}
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1d1d1f]">cURL</h2>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">非流式请求</h3>
      <CodeBlock
        language="bash"
        title="非流式"
        code={`curl https://your-domain.com/api/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\\\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">流式请求</h3>
      <CodeBlock
        language="bash"
        title="流式"
        code={`curl https://your-domain.com/api/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\\\
  -N \\\\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "stream": true
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1d1d1f]">获取模型列表</h3>
      <CodeBlock
        language="bash"
        title="模型列表"
        code={`curl https://your-domain.com/api/v1/models \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key"`}
      />

      {/* Tips */}
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1d1d1f]">使用提示</h2>
      <ul className="mb-4 ml-6 list-disc space-y-2 text-[17px] leading-relaxed text-[#424245]">
        <li>
          将 <code className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-xs text-[#007AFF]">your-domain.com</code> 替换为实际的 Dezix AI 域名
        </li>
        <li>
          将 <code className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-xs text-[#007AFF]">sk-dezix-your-api-key</code> 替换为您的真实 API Key
        </li>
        <li>
          可以通过切换 <code className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-xs text-[#007AFF]">model</code> 参数来使用不同的模型，如 claude-3-5-sonnet-20241022、gemini-1.5-pro 等
        </li>
        <li>建议将 API Key 存储在环境变量中，避免硬编码在代码里</li>
        <li>
          生产环境中建议添加错误处理和重试逻辑
        </li>
      </ul>
    </article>
  );
}
