import { describe, it, expect } from "vitest";
import { getModelBrand, getBrandList } from "../brand";

describe("getModelBrand", () => {
  describe("OpenAI models", () => {
    it("matches openai/ prefix", () => {
      expect(getModelBrand("openai/gpt-4o")).toBe("OpenAI");
    });

    it("matches gpt- prefix", () => {
      expect(getModelBrand("gpt-4o-mini")).toBe("OpenAI");
    });

    it("matches o1/o3 prefix", () => {
      expect(getModelBrand("o1-preview")).toBe("OpenAI");
      expect(getModelBrand("o3-mini")).toBe("OpenAI");
    });

    it("matches chatgpt- prefix", () => {
      expect(getModelBrand("chatgpt-4o-latest")).toBe("OpenAI");
    });
  });

  describe("Anthropic models", () => {
    it("matches claude- prefix", () => {
      expect(getModelBrand("claude-3.5-sonnet")).toBe("Anthropic");
      expect(getModelBrand("claude-opus-4-20250514")).toBe("Anthropic");
    });
  });

  describe("Google models", () => {
    it("matches gemini- prefix", () => {
      expect(getModelBrand("gemini-2.0-flash")).toBe("Google");
    });
  });

  describe("DeepSeek models", () => {
    it("matches deepseek prefix", () => {
      expect(getModelBrand("deepseek-chat")).toBe("DeepSeek");
      expect(getModelBrand("deepseek-reasoner")).toBe("DeepSeek");
    });
  });

  describe("xAI models", () => {
    it("matches x-ai/ prefix", () => {
      expect(getModelBrand("x-ai/grok-2")).toBe("xAI");
    });

    it("matches grok- prefix", () => {
      expect(getModelBrand("grok-beta")).toBe("xAI");
    });
  });

  describe("Chinese provider models", () => {
    it("matches doubao- as ByteDance", () => {
      expect(getModelBrand("doubao-pro-32k")).toBe("ByteDance");
    });

    it("matches qwen as Alibaba", () => {
      expect(getModelBrand("qwen-turbo")).toBe("Alibaba");
      expect(getModelBrand("qwen2.5-72b-instruct")).toBe("Alibaba");
    });

    it("matches glm- as Zhipu", () => {
      expect(getModelBrand("glm-4-flash")).toBe("Zhipu");
    });

    it("matches kimi- as Moonshot", () => {
      expect(getModelBrand("kimi-latest")).toBe("Moonshot");
    });

    it("matches MiniMax prefix", () => {
      expect(getModelBrand("MiniMax-Text-01")).toBe("MiniMax");
    });

    it("matches xiaomi/ as Xiaomi", () => {
      expect(getModelBrand("xiaomi/mimo-vl-7b")).toBe("Xiaomi");
    });

    it("matches meituan/ as Meituan", () => {
      expect(getModelBrand("meituan/fine-grained")).toBe("Meituan");
    });

    it("matches stepfun/ as StepFun", () => {
      expect(getModelBrand("stepfun/step-2-16k")).toBe("StepFun");
    });
  });

  describe("Other providers", () => {
    it("matches kling- as Kling", () => {
      expect(getModelBrand("kling-v1")).toBe("Kling");
    });

    it("matches vidu as Vidu", () => {
      expect(getModelBrand("vidu-gen4")).toBe("Vidu");
      expect(getModelBrand("viduq")).toBe("Vidu");
    });

    it("matches openrouter/ as OpenRouter", () => {
      expect(getModelBrand("openrouter/auto")).toBe("OpenRouter");
    });
  });

  describe("Fallback behavior", () => {
    it("uses prefix before / for unknown models", () => {
      expect(getModelBrand("custom-provider/model-v1")).toBe("custom-provider");
    });

    it("returns Other for unknown models without /", () => {
      expect(getModelBrand("unknown-model")).toBe("Other");
    });

    it("matches asr/tts as Qiniu", () => {
      expect(getModelBrand("asr")).toBe("Qiniu");
      expect(getModelBrand("tts")).toBe("Qiniu");
    });
  });
});

describe("getBrandList", () => {
  it("returns sorted unique brands", () => {
    const ids = ["gpt-4o", "claude-3.5-sonnet", "gpt-4o-mini", "deepseek-chat"];
    const result = getBrandList(ids);
    expect(result).toEqual(["Anthropic", "DeepSeek", "OpenAI"]);
  });

  it("returns empty array for empty input", () => {
    expect(getBrandList([])).toEqual([]);
  });

  it("deduplicates brands from same provider", () => {
    const ids = ["gpt-4o", "gpt-4o-mini", "o1-preview"];
    expect(getBrandList(ids)).toEqual(["OpenAI"]);
  });

  it("includes fallback brands", () => {
    const ids = ["gpt-4o", "some-unknown-model"];
    const result = getBrandList(ids);
    expect(result).toContain("OpenAI");
    expect(result).toContain("Other");
  });
});
