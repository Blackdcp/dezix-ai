"use client";

import { CodeBlock } from "@/components/docs/code-block";

export default function QuickStartPage() {
  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold">快速开始</h1>
      <p className="mb-8 text-muted-foreground">
        几分钟内完成 Dezix AI 的接入，开始调用 AI 模型。
      </p>

      {/* Step 1 */}
      <h2 className="mb-3 mt-8 text-xl font-bold">1. 注册账号</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        访问{" "}
        <a href="/register" className="text-primary hover:underline">
          注册页面
        </a>
        ，填写邮箱和密码即可完成注册。注册后将自动获得免费体验额度。
      </p>

      {/* Step 2 */}
      <h2 className="mb-3 mt-8 text-xl font-bold">2. 获取 API Key</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        登录控制台后，进入「API 密钥」页面，点击「创建密钥」。创建成功后请立即复制并妥善保存，
        密钥只会显示一次。API Key 格式为 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">sk-dezix-xxx</code>。
      </p>

      {/* Step 3 */}
      <h2 className="mb-3 mt-8 text-xl font-bold">3. 发送第一个请求</h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        Dezix AI 完全兼容 OpenAI API 格式。将 Base URL 替换为 Dezix AI 的地址，使用您的 API Key 即可。
      </p>

      <h3 className="mb-2 mt-6 text-lg font-semibold">cURL</h3>
      <CodeBlock
        language="bash"
        title="cURL"
        code={`curl https://your-domain.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold">Python</h3>
      <CodeBlock
        language="python"
        title="Python (openai SDK)"
        code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-dezix-your-api-key",
    base_url="https://your-domain.com/api/v1"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(response.choices[0].message.content)`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold">Node.js</h3>
      <CodeBlock
        language="javascript"
        title="Node.js (openai SDK)"
        code={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-dezix-your-api-key",
  baseURL: "https://your-domain.com/api/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "user", content: "你好，请介绍一下你自己" },
  ],
});

console.log(response.choices[0].message.content);`}
      />

      {/* Step 4 */}
      <h2 className="mb-3 mt-8 text-xl font-bold">4. 下一步</h2>
      <ul className="mb-4 ml-6 list-disc space-y-2 text-sm text-muted-foreground">
        <li>
          查看{" "}
          <a href="/docs/api-reference" className="text-primary hover:underline">
            API 参考
          </a>
          ，了解完整的接口文档
        </li>
        <li>
          查看{" "}
          <a href="/docs/sdk-examples" className="text-primary hover:underline">
            SDK 示例
          </a>
          ，获取更多语言的代码示例
        </li>
        <li>
          访问{" "}
          <a href="/model-list" className="text-primary hover:underline">
            模型列表
          </a>
          ，浏览所有可用模型
        </li>
        <li>
          在控制台的{" "}
          <a href="/playground" className="text-primary hover:underline">
            Playground
          </a>
          {" "}中在线测试 API
        </li>
      </ul>
    </article>
  );
}
