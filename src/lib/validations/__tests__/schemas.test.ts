import { describe, it, expect } from "vitest";
import {
  registerSchema,
  chatCompletionRequestSchema,
  createApiKeySchema,
  topupSchema,
  changePasswordSchema,
  updateSettingsSchema,
  adminCreateModelSchema,
  adminAdjustBalanceSchema,
  adminCreateChannelSchema,
} from "../index";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with referral code", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "12345678",
      referralCode: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "not-an-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });
});

describe("chatCompletionRequestSchema", () => {
  it("accepts valid chat request", () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts streaming request with params", () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: "gpt-4",
      messages: [{ role: "system", content: "You are helpful" }, { role: "user", content: "Hi" }],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing model", () => {
    const result = chatCompletionRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty messages array", () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: "gpt-4",
      messages: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects temperature out of range", () => {
    const result = chatCompletionRequestSchema.safeParse({
      model: "gpt-4",
      messages: [{ role: "user", content: "Hello" }],
      temperature: 3.0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createApiKeySchema", () => {
  it("accepts valid input", () => {
    const result = createApiKeySchema.safeParse({ name: "My Key" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createApiKeySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = createApiKeySchema.safeParse({
      name: "My Key",
      rateLimit: 100,
      modelWhitelist: ["gpt-4"],
    });
    expect(result.success).toBe(true);
  });
});

describe("topupSchema", () => {
  it("accepts valid amount", () => {
    const result = topupSchema.safeParse({ amount: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = topupSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects amount over 10000", () => {
    const result = topupSchema.safeParse({ amount: 10001 });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = topupSchema.safeParse({ amount: -5 });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid passwords", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "old12345",
      newPassword: "new12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short new password", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "old12345",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty old password", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "",
      newPassword: "new12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSettingsSchema", () => {
  it("accepts name update", () => {
    const result = updateSettingsSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts email update", () => {
    const result = updateSettingsSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateSettingsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("adminCreateModelSchema", () => {
  it("accepts valid model", () => {
    const result = adminCreateModelSchema.safeParse({
      modelId: "gpt-4",
      displayName: "GPT-4",
      providerId: "openai-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("chat");
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects missing modelId", () => {
    const result = adminCreateModelSchema.safeParse({
      displayName: "GPT-4",
      providerId: "openai-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminAdjustBalanceSchema", () => {
  it("accepts positive amount", () => {
    const result = adminAdjustBalanceSchema.safeParse({ amount: 100 });
    expect(result.success).toBe(true);
  });

  it("accepts negative amount", () => {
    const result = adminAdjustBalanceSchema.safeParse({ amount: -50 });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = adminAdjustBalanceSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });
});

describe("adminCreateChannelSchema", () => {
  it("accepts valid channel", () => {
    const result = adminCreateChannelSchema.safeParse({
      providerId: "p1",
      name: "Channel 1",
      apiKey: "sk-xxx",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe(0);
      expect(result.data.weight).toBe(1);
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects missing apiKey", () => {
    const result = adminCreateChannelSchema.safeParse({
      providerId: "p1",
      name: "Channel 1",
    });
    expect(result.success).toBe(false);
  });
});
