"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function QuickStartPage() {
  const t = useTranslations("QuickStart");

  return (
    <article className="prose-sm max-w-none">
      <h1 className="mb-2 text-3xl font-bold tracking-[-0.015em] text-[#1C1917]">{t("title")}</h1>
      <p className="mb-8 text-[17px] leading-relaxed text-[#57534E]">
        {t("subtitle")}
      </p>

      {/* Step 1 */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("step1Title")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#57534E]">
        {t("step1Text1")}{" "}
        <Link href="/register" className="text-[#6366F1] hover:underline">
          {t("step1Link")}
        </Link>
        {" "}{t("step1Text2")}
      </p>

      {/* Step 2 */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("step2Title")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#57534E]">
        {t("step2Text")}
      </p>

      {/* Step 3 */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("step3Title")}</h2>
      <p className="mb-4 text-[17px] leading-relaxed text-[#57534E]">
        {t("step3Text")}
      </p>

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">cURL</h3>
      <CodeBlock
        language="bash"
        title="cURL"
        code={`curl https://your-domain.com/api/v1/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer sk-dezix-your-api-key" \\\\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello, introduce yourself"}
    ]
  }'`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">Python</h3>
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
        {"role": "user", "content": "Hello, introduce yourself"}
    ]
)

print(response.choices[0].message.content)`}
      />

      <h3 className="mb-2 mt-6 text-lg font-semibold text-[#1C1917]">Node.js</h3>
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
    { role: "user", content: "Hello, introduce yourself" },
  ],
});

console.log(response.choices[0].message.content);`}
      />

      {/* Step 4 */}
      <h2 className="mb-3 mt-8 text-xl font-bold text-[#1C1917]">{t("step4Title")}</h2>
      <ul className="mb-4 ml-6 list-disc space-y-2 text-[17px] leading-relaxed text-[#57534E]">
        <li>
          <Link href="/docs/api-reference" className="text-[#6366F1] hover:underline">
            {t("step4ApiRef")}
          </Link>
          {" "}{t("step4ApiRefDesc")}
        </li>
        <li>
          <Link href="/docs/sdk-examples" className="text-[#6366F1] hover:underline">
            {t("step4Sdk")}
          </Link>
          {" "}{t("step4SdkDesc")}
        </li>
        <li>
          <Link href="/model-list" className="text-[#6366F1] hover:underline">
            {t("step4Models")}
          </Link>
          {" "}{t("step4ModelsDesc")}
        </li>
        <li>
          <Link href="/playground" className="text-[#6366F1] hover:underline">
            {t("step4Playground")}
          </Link>
          {" "}{t("step4PlaygroundDesc")}
        </li>
      </ul>
    </article>
  );
}
