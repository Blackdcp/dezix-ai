// Static metadata for models — badges, features, input/output types
// Mirrors Sufy's model marketplace data exactly

export type BadgeType = "new" | "hot" | "free" | "limited-free";
export type FeatureTag =
  | "tool-calling"
  | "deep-thinking"
  | "image-understanding"
  | "video-understanding"
  | "long-context"
  | "ai-programming"
  | "structured-output"
  | "image-generation"
  | "video-generation"
  | "conversation"
  | "high-tps"
  | "audio";

export type IOType = "text" | "image" | "audio" | "video" | "file";

export interface ModelMeta {
  badges: BadgeType[];
  features: FeatureTag[];
  inputTypes: IOType[];
  outputTypes: IOType[];
}

// ============================================================
// Badge assignments — matches Sufy exactly (2026-03-07)
// ============================================================

const NEW_MODELS = new Set([
  "openai/gpt-5.4",
  "gemini-3.1-flash-lite-preview",
  "kling-v3-omni",
  "kling-v3",
  "veo-3.1-fast-generate-001",
  "veo-3.1-generate-001",
  "openai/gpt-5-mini",
  "openai/gpt-5",
  "openai/gpt-5-pro",
  "openai/gpt-5.2",
  "gemini-3.1-flash-image-preview",
  "openai/gpt-5-nano",
  "qwen3.5-397b-a17b",
  "gemini-3.1-pro-preview",
  "claude-4.6-sonnet",
  "doubao-seed-2.0-lite",
  "doubao-seed-2.0-mini",
  "doubao-seed-2.0-pro",
  "doubao-seed-2.0-code",
  "minimax/minimax-m2.5-highspeed",
  "minimax/minimax-m2.5",
  "z-ai/glm-5",
  "stepfun/step-3.5-flash",
  "sora-2-pro",
  "moonshotai/kimi-k2.5",
  "kling-v2-6",
  "xiaomi/mimo-v2-flash",
  "openai/gpt-5.3-codex",
  "claude-4.6-opus",
  "openai/gpt-5.2-chat",
  "kling-image-o1",
  "gemini-3.0-flash-preview",
  "gemini-3.0-pro-image-preview",
  "claude-4.5-opus",
  "gemini-3.0-pro-preview",
  "kling-video-o1",
  "deepseek-v3.2",
  "gemini-2.5-flash-image",
  "veo-3.1-fast-generate-preview",
  "veo-3.1-generate-preview",
  "claude-4.5-haiku",
  "claude-4.5-sonnet",
  "deepseek-v3.2-exp-thinking",
  "deepseek-v3.2-exp",
  "veo-3.0-fast-generate-preview",
  "veo-3.0-generate-preview",
  "veo-3.0-fast-generate-001",
  "veo-3.0-generate-001",
  "veo-2.0-generate-001",
  "viduq2-turbo",
  "viduq2-pro",
  "viduq2",
  "viduq1",
]);

const HOT_MODELS = new Set([
  "kling-v3-omni",
  "kling-v3",
  "minimax/minimax-m2.1",
  "z-ai/glm-4.7",
  "kimi-k2-thinking",
  "x-ai/grok-code-fast-1",
  "qwen3-235b-a22b-thinking-2507",
  "qwen3-235b-a22b-instruct-2507",
  "deepseek-r1",
  "deepseek-r1-0528",
  "deepseek-v3-0324",
  "claude-4.1-opus",
  "claude-4.0-opus",
  "claude-4.0-sonnet",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
]);

const FREE_MODELS = new Set([
  "arcee-ai/trinity-large-preview",
  "stepfun/step-3.5-flash",
]);

const LIMITED_FREE_MODELS = new Set([
  "meituan/longcat-flash-lite",
]);

// ============================================================
// Feature tag inference from modelId + category
// ============================================================

function inferFeatures(modelId: string, category: string): FeatureTag[] {
  const lower = modelId.toLowerCase();
  const features: FeatureTag[] = [];

  // Video generation models
  if (category === "video") {
    features.push("video-generation");
    return features;
  }

  // Image generation models
  if (category === "image") {
    features.push("image-generation");
    return features;
  }

  // Audio models
  if (category === "audio") {
    features.push("audio");
    return features;
  }

  // Reasoning models
  if (category === "reasoning") {
    features.push("deep-thinking");
    if (!lower.includes("lite") && !lower.includes("flash")) {
      features.push("tool-calling");
    }
    features.push("conversation");
    if (lower.includes("code") || lower.includes("codex")) {
      features.push("ai-programming");
    }
    return features;
  }

  // Code models
  if (category === "code") {
    features.push("ai-programming");
    features.push("tool-calling");
    features.push("conversation");
    return features;
  }

  // Multimodal models
  if (category === "multimodal") {
    features.push("image-understanding");
    features.push("conversation");
    features.push("tool-calling");
    if (lower.includes("video") || lower.includes("omni")) {
      features.push("video-understanding");
    }
    return features;
  }

  // Chat models — the default
  features.push("conversation");
  features.push("tool-calling");

  // Large context models
  const brand = getBrandForFeatures(lower);
  if (brand === "Google" || lower.includes("long") || lower.includes("1m")) {
    features.push("long-context");
  }

  // Structured output for capable models
  if (
    brand === "OpenAI" ||
    brand === "Anthropic" ||
    brand === "Google" ||
    lower.includes("glm-5") ||
    lower.includes("glm-4") ||
    lower.includes("qwen3")
  ) {
    features.push("structured-output");
  }

  // Image understanding for vision-capable chat models
  if (
    lower.includes("flash-image") ||
    lower.includes("pro-image") ||
    lower.includes("-vl") ||
    lower.includes("vision") ||
    lower.includes("mimo")
  ) {
    features.push("image-understanding");
  }

  // Image generation for image-capable models
  if (lower.includes("flash-image") || lower.includes("pro-image")) {
    features.push("image-generation");
  }

  return features;
}

function getBrandForFeatures(lower: string): string {
  if (lower.startsWith("openai/") || lower.startsWith("gpt-") || lower.startsWith("sora-")) return "OpenAI";
  if (lower.startsWith("claude-")) return "Anthropic";
  if (lower.startsWith("gemini-") || lower.startsWith("veo-")) return "Google";
  return "";
}

// ============================================================
// Input/Output type inference
// ============================================================

function inferIOTypes(modelId: string, category: string): { inputTypes: IOType[]; outputTypes: IOType[] } {
  if (category === "video") {
    return { inputTypes: ["text", "image"], outputTypes: ["video"] };
  }
  if (category === "image") {
    return { inputTypes: ["text", "image"], outputTypes: ["image"] };
  }
  if (category === "audio") {
    const lower = modelId.toLowerCase();
    if (lower === "asr") return { inputTypes: ["audio"], outputTypes: ["text"] };
    if (lower === "tts") return { inputTypes: ["text"], outputTypes: ["audio"] };
    return { inputTypes: ["audio", "text"], outputTypes: ["audio", "text"] };
  }
  if (category === "multimodal") {
    const inputTypes: IOType[] = ["text", "image"];
    const lower = modelId.toLowerCase();
    if (lower.includes("omni") || lower.includes("video")) {
      inputTypes.push("video");
    }
    // Some multimodal models can generate images
    const outputTypes: IOType[] = ["text"];
    if (lower.includes("flash-image") || lower.includes("pro-image")) {
      outputTypes.push("image");
    }
    return { inputTypes, outputTypes };
  }
  // Chat, reasoning, code — text in, text out
  return { inputTypes: ["text"], outputTypes: ["text"] };
}

// ============================================================
// Public API
// ============================================================

export function getModelMetadata(modelId: string, category: string): ModelMeta {
  const badges: BadgeType[] = [];
  if (NEW_MODELS.has(modelId)) badges.push("new");
  if (HOT_MODELS.has(modelId)) badges.push("hot");
  if (FREE_MODELS.has(modelId)) badges.push("free");
  if (LIMITED_FREE_MODELS.has(modelId)) badges.push("limited-free");

  const features = inferFeatures(modelId, category);
  const { inputTypes, outputTypes } = inferIOTypes(modelId, category);

  return { badges, features, inputTypes, outputTypes };
}
