import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to set the env var before importing
const TEST_KEY = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";

describe("encryption", () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    // Clear module cache so encryption.ts re-reads env
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ENCRYPTION_KEY = originalEnv;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  it("encrypts and decrypts a string (roundtrip)", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const plaintext = "sk-test-key-12345";
    const encrypted = encrypt(plaintext);

    // Encrypted string should be different from plaintext
    expect(encrypted).not.toBe(plaintext);
    // Should have 3 colon-separated parts
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time", async () => {
    const { encrypt } = await import("../encryption");
    const plaintext = "same-input";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);
    // Different IV should produce different ciphertext
    expect(enc1).not.toBe(enc2);
  });

  it("decrypt returns plaintext for non-encrypted strings (backward compat)", async () => {
    const { decrypt } = await import("../encryption");
    const plain = "sk-openai-abcdef123456";
    expect(decrypt(plain)).toBe(plain);
  });

  it("decrypt returns original for strings with wrong format", async () => {
    const { decrypt } = await import("../encryption");
    const notEncrypted = "just:two:parts:but-invalid-base64";
    // 4 parts, doesn't match 3-part format
    expect(decrypt(notEncrypted)).toBe(notEncrypted);
  });

  it("handles empty string", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const encrypted = encrypt("");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe("");
  });

  it("handles unicode characters", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const plaintext = "密钥-test-🔑";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("throws error when ENCRYPTION_KEY is missing", async () => {
    delete process.env.ENCRYPTION_KEY;
    const { encrypt } = await import("../encryption");
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
  });

  it("throws error when ENCRYPTION_KEY is wrong length", async () => {
    process.env.ENCRYPTION_KEY = "too-short";
    const { encrypt } = await import("../encryption");
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
  });
});
