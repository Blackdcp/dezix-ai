"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { useTranslations } from "next-intl";

export default function SdkExamplesPage() {
  const t = useTranslations("SdkExamples");

  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1a1a2e]">{t("title")}</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#52525b]">
        {t("subtitle")}
      </p>

      {/* Python */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1a1a2e]">Python</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#52525b]">
        {t("installPython")}
      </p>
      <CodeBlock language="bash" title={t("install")} code="pip install openai" />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("basicChat")}</h3>
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
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": "Write a quicksort algorithm in Python"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("streamingResponse")}</h3>
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
        {"role": "user", "content": "Tell me a short story"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("multiTurn")}</h3>
      <CodeBlock
        language="python"
        title="multi_turn.py"
        code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-dezix-your-api-key",
    base_url="https://your-domain.com/api/v1"
)

messages = [
    {"role": "system", "content": "You are a professional translator."}
]

# Turn 1
messages.append({"role": "user", "content": "Translate 'Hello World' to French"})
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
assistant_msg = response.choices[0].message.content
messages.append({"role": "assistant", "content": assistant_msg})
print(f"Assistant: {assistant_msg}")

# Turn 2
messages.append({"role": "user", "content": "Now translate it to Japanese"})
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
print(f"Assistant: {response.choices[0].message.content}")`}
      />

      {/* Node.js */}
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1a1a2e]">Node.js</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#52525b]">
        {t("installNode")}
      </p>
      <CodeBlock language="bash" title={t("install")} code="npm install openai" />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("basicChat")}</h3>
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
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: "Write a bubble sort in JavaScript" },
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

console.log(response.choices[0].message.content);`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("streamingResponse")}</h3>
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
    { role: "user", content: "Tell me a short story" },
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
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1a1a2e]">cURL</h2>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("nonStream")}</h3>
      <CodeBlock
        language="bash"
        title={t("nonStream")}
        code={`curl https://your-domain.com/api/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\\\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("streamRequest")}</h3>
      <CodeBlock
        language="bash"
        title={t("streamRequest")}
        code={`curl https://your-domain.com/api/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\\\
  -N \\\\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "stream": true
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1a1a2e]">{t("getModels")}</h3>
      <CodeBlock
        language="bash"
        title={t("getModels")}
        code={`curl https://your-domain.com/api/v1/models \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key"`}
      />

      {/* Tips */}
      <h2 className="mb-3 mt-10 text-xl font-bold text-[#1a1a2e]">{t("tipsTitle")}</h2>
      <ul className="mb-4 ml-6 list-disc space-y-2 text-[17px] leading-relaxed text-[#52525b]">
        <li>{t("tip1")}</li>
        <li>{t("tip2")}</li>
        <li>{t("tip3")}</li>
        <li>{t("tip4")}</li>
        <li>{t("tip5")}</li>
      </ul>
    </article>
  );
}
