import { describe, it, expect } from "vitest";
import { addCorsHeaders, corsOptionsResponse } from "../cors";

describe("addCorsHeaders", () => {
  it("adds CORS headers to a response", () => {
    const res = new Response("ok", { status: 200 });
    const result = addCorsHeaders(res);

    expect(result.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(result.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
    expect(result.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
  });

  it("returns the same response object", () => {
    const res = new Response("body");
    const result = addCorsHeaders(res);
    expect(result).toBe(res);
  });

  it("preserves existing headers", () => {
    const res = new Response("ok", {
      headers: { "X-Custom": "value" },
    });
    addCorsHeaders(res);
    expect(res.headers.get("X-Custom")).toBe("value");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("overwrites conflicting CORS headers", () => {
    const res = new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "https://example.com" },
    });
    addCorsHeaders(res);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

describe("corsOptionsResponse", () => {
  it("returns 204 status", () => {
    const res = corsOptionsResponse();
    expect(res.status).toBe(204);
  });

  it("returns null body", async () => {
    const res = corsOptionsResponse();
    expect(await res.text()).toBe("");
  });

  it("includes all CORS headers", () => {
    const res = corsOptionsResponse();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
  });
});
