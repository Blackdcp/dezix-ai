// modelId prefix → brand name mapping
// Hides upstream provider (qiniu) from end users

const BRAND_RULES: [RegExp, string][] = [
  [/^openai\//, "OpenAI"],
  [/^(gpt-|o[1-9]|chatgpt-)/, "OpenAI"],
  [/^claude-/, "Anthropic"],
  [/^gemini-/, "Google"],
  [/^deepseek/, "DeepSeek"],
  [/^(x-ai\/|grok-)/, "xAI"],
  [/^doubao-/, "ByteDance"],
  [/^qwen/, "Alibaba"],
  [/^(glm-|z-ai\/)/, "Zhipu"],
  [/^(kimi-|moonshotai\/)/, "Moonshot"],
  [/^([Mm]ini[Mm]ax|minimax\/)/, "MiniMax"],
  [/^xiaomi\//, "Xiaomi"],
  [/^meituan\//, "Meituan"],
  [/^stepfun\//, "StepFun"],
  [/^openrouter\//, "OpenRouter"],
  [/^kling-/, "Kling"],
  [/^viduq?/, "Vidu"],
  [/^asr$|^tts$/, "Qiniu"],
];

export function getModelBrand(modelId: string): string {
  for (const [pattern, brand] of BRAND_RULES) {
    if (pattern.test(modelId)) return brand;
  }
  // Fallback: use prefix before "/" or "Other"
  const slashIdx = modelId.indexOf("/");
  return slashIdx > 0 ? modelId.slice(0, slashIdx) : "Other";
}

/** Get deduplicated brand list from an array of modelIds */
export function getBrandList(modelIds: string[]): string[] {
  const brands = new Set<string>();
  for (const id of modelIds) {
    brands.add(getModelBrand(id));
  }
  return Array.from(brands).sort();
}
