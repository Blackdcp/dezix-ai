// modelId prefix → brand name mapping
// Hides upstream provider (qiniu) from end users

const BRAND_RULES: [RegExp, string][] = [
  [/^openai\//, "OpenAI"],
  [/^claude-/, "Anthropic"],
  [/^gemini-/, "Google"],
  [/^deepseek/, "DeepSeek"],
  [/^x-ai\//, "xAI"],
  [/^doubao-/, "字节跳动"],
  [/^qwen/, "阿里云"],
  [/^glm-/, "智谱 AI"],
  [/^z-ai\//, "智谱 AI"],
  [/^kimi-/, "月之暗面"],
  [/^moonshotai\//, "月之暗面"],
  [/^[Mm]ini[Mm]ax/, "MiniMax"],
  [/^minimax\//, "MiniMax"],
  [/^xiaomi\//, "小米"],
  [/^meituan\//, "美团"],
  [/^stepfun\//, "阶跃星辰"],
  [/^openrouter\//, "OpenRouter"],
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
