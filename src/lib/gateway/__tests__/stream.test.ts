import { describe, it, expect, vi } from "vitest";
import { createStreamTransformer, buildStreamUrl } from "../stream";
import type { ProviderAdapter } from "../adapters/base";
import { GoogleAdapter } from "../adapters/google";

function makeAdapter(overrides: Partial<ProviderAdapter> = {}): ProviderAdapter {
  return {
    transformStreamChunk: vi.fn().mockReturnValue(null),
    transformResponse: vi.fn(),
    buildUrl: vi.fn().mockReturnValue("https://api.example.com/v1/chat/completions"),
    buildHeaders: vi.fn().mockReturnValue({}),
    buildBody: vi.fn().mockReturnValue({}),
    ...overrides,
  } as unknown as ProviderAdapter;
}

function makeUpstreamResponse(lines: string[]): Response {
  const text = lines.join("\n") + "\n";
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(body);
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

describe("createStreamTransformer", () => {
  it("returns stream and usagePromise", () => {
    const resp = makeUpstreamResponse(["data: [DONE]"]);
    const adapter = makeAdapter();
    const result = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");

    expect(result.stream).toBeInstanceOf(ReadableStream);
    expect(result.usagePromise).toBeInstanceOf(Promise);
  });

  it("passes through [DONE] signal", async () => {
    const resp = makeUpstreamResponse(["data: [DONE]"]);
    const adapter = makeAdapter();
    const { stream } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");
    const output = await readStream(stream);
    expect(output).toContain("data: [DONE]");
  });

  it("transforms chunks via adapter and emits SSE format", async () => {
    const chunk = {
      id: "chatcmpl-1",
      choices: [{ delta: { content: "Hello" }, index: 0 }],
    };

    const adapter = makeAdapter({
      transformStreamChunk: vi.fn()
        .mockReturnValueOnce(chunk)
        .mockReturnValueOnce(null), // [DONE] line returns null
    });

    const resp = makeUpstreamResponse([
      "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}",
      "data: [DONE]",
    ]);

    const { stream, usagePromise } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");
    const output = await readStream(stream);

    expect(output).toContain("data: ");
    expect(output).toContain("Hello");
    expect(output).toContain("data: [DONE]");

    const { usage, content } = await usagePromise;
    expect(content).toBe("Hello");
    expect(usage.total_tokens).toBe(0); // no usage in chunks
  });

  it("accumulates usage from chunks", async () => {
    const chunk1 = {
      choices: [{ delta: { content: "Hi" }, index: 0 }],
      usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
    };
    const chunk2 = {
      choices: [{ delta: { content: " there" }, index: 0 }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };

    const adapter = makeAdapter({
      transformStreamChunk: vi.fn()
        .mockReturnValueOnce(chunk1)
        .mockReturnValueOnce(chunk2),
    });

    const resp = makeUpstreamResponse([
      "data: chunk1",
      "data: chunk2",
    ]);

    const { stream, usagePromise } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");
    await readStream(stream);

    const { usage, content } = await usagePromise;
    expect(content).toBe("Hi there");
    expect(usage.prompt_tokens).toBe(10);
    expect(usage.completion_tokens).toBe(5);
    expect(usage.total_tokens).toBe(15);
  });

  it("handles response with no body", async () => {
    const resp = new Response(null);
    const adapter = makeAdapter();
    const { stream, usagePromise } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");

    const output = await readStream(stream);
    expect(output).toBe("");

    const { usage, content } = await usagePromise;
    expect(content).toBe("");
    expect(usage.total_tokens).toBe(0);
  });

  it("appends [DONE] if upstream does not send it", async () => {
    const chunk = {
      choices: [{ delta: { content: "test" }, index: 0 }],
    };
    const adapter = makeAdapter({
      transformStreamChunk: vi.fn().mockReturnValue(chunk),
    });
    const resp = makeUpstreamResponse(["data: something"]);

    const { stream } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");
    const output = await readStream(stream);
    expect(output).toContain("data: [DONE]");
  });

  it("skips empty lines", async () => {
    const adapter = makeAdapter();
    const resp = makeUpstreamResponse(["", "  ", "data: [DONE]"]);

    const { stream } = createStreamTransformer(resp, adapter, "gpt-4o", "req-1");
    const output = await readStream(stream);

    // [DONE] is the only non-empty line; adapter sees it but returns null,
    // then the [DONE] check picks it up
    expect(output).toContain("data: [DONE]");
  });
});

describe("buildStreamUrl", () => {
  it("uses adapter.buildUrl for non-Google adapters", () => {
    const adapter = makeAdapter({
      buildUrl: vi.fn().mockReturnValue("https://api.example.com/v1/chat"),
    });

    const url = buildStreamUrl(adapter, "https://api.example.com", "gpt-4o", "sk-test");
    expect(url).toBe("https://api.example.com/v1/chat");
    expect(adapter.buildUrl).toHaveBeenCalledWith("https://api.example.com", "gpt-4o");
  });

  it("uses GoogleAdapter.buildStreamUrl for Google adapter", () => {
    const googleAdapter = new GoogleAdapter();
    vi.spyOn(googleAdapter, "buildStreamUrl").mockReturnValue("https://google.api/stream");

    const url = buildStreamUrl(googleAdapter, "https://google.api", "gemini-pro", "key-123");
    expect(url).toBe("https://google.api/stream");
    expect(googleAdapter.buildStreamUrl).toHaveBeenCalledWith("https://google.api", "gemini-pro", "key-123");
  });
});
