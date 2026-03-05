import { describe, it, expect } from "vitest";
import {
  GatewayError,
  authenticationError,
  rateLimitError,
  insufficientBalanceError,
  modelNotFoundError,
  modelNotAllowedError,
  noAvailableChannelError,
  invalidRequestError,
  upstreamError,
  internalError,
} from "../errors";

describe("GatewayError", () => {
  it("sets name to GatewayError", () => {
    const err = new GatewayError("test", "test_code", 400);
    expect(err.name).toBe("GatewayError");
  });

  it("extends Error with correct message", () => {
    const err = new GatewayError("something went wrong", "err_code", 500);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("something went wrong");
  });

  it("stores code and statusCode", () => {
    const err = new GatewayError("msg", "my_code", 418);
    expect(err.code).toBe("my_code");
    expect(err.statusCode).toBe(418);
  });

  it("stores optional param", () => {
    const err = new GatewayError("msg", "code", 400, "model");
    expect(err.param).toBe("model");
  });

  it("param defaults to undefined when not provided", () => {
    const err = new GatewayError("msg", "code", 400);
    expect(err.param).toBeUndefined();
  });

  describe("toJSON()", () => {
    it("returns OpenAI-compatible error shape", () => {
      const err = new GatewayError("bad request", "invalid_request_error", 400, "model");
      expect(err.toJSON()).toEqual({
        error: {
          message: "bad request",
          type: "invalid_request_error",
          param: "model",
          code: "invalid_request_error",
        },
      });
    });

    it("returns param as null when not provided", () => {
      const err = new GatewayError("msg", "code", 500);
      expect(err.toJSON().error.param).toBeNull();
    });
  });
});

describe("Error factories", () => {
  it("authenticationError returns 401 with default message", () => {
    const err = authenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("invalid_api_key");
    expect(err.message).toBe("Invalid API key");
  });

  it("authenticationError accepts custom message", () => {
    const err = authenticationError("custom msg");
    expect(err.message).toBe("custom msg");
    expect(err.statusCode).toBe(401);
  });

  it("rateLimitError returns 429", () => {
    const err = rateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("rate_limit_exceeded");
    expect(err.message).toBe("Rate limit exceeded");
  });

  it("insufficientBalanceError returns 402", () => {
    const err = insufficientBalanceError();
    expect(err.statusCode).toBe(402);
    expect(err.code).toBe("insufficient_balance");
  });

  it("modelNotFoundError returns 404 with model param", () => {
    const err = modelNotFoundError("gpt-5");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("model_not_found");
    expect(err.param).toBe("model");
    expect(err.message).toContain("gpt-5");
  });

  it("modelNotAllowedError returns 403 with model param", () => {
    const err = modelNotAllowedError("claude-4");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("model_not_allowed");
    expect(err.param).toBe("model");
    expect(err.message).toContain("claude-4");
  });

  it("noAvailableChannelError returns 503 with model param", () => {
    const err = noAvailableChannelError("deepseek-v3");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("no_available_channel");
    expect(err.param).toBe("model");
    expect(err.message).toContain("deepseek-v3");
  });

  it("invalidRequestError returns 400 with optional param", () => {
    const err = invalidRequestError("bad field", "temperature");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("invalid_request_error");
    expect(err.param).toBe("temperature");
  });

  it("invalidRequestError works without param", () => {
    const err = invalidRequestError("bad");
    expect(err.param).toBeUndefined();
  });

  it("upstreamError returns 502", () => {
    const err = upstreamError();
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe("upstream_error");
  });

  it("internalError returns 500", () => {
    const err = internalError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("internal_error");
  });

  it("all factories return GatewayError instances", () => {
    const errors = [
      authenticationError(),
      rateLimitError(),
      insufficientBalanceError(),
      modelNotFoundError("x"),
      modelNotAllowedError("x"),
      noAvailableChannelError("x"),
      invalidRequestError("x"),
      upstreamError(),
      internalError(),
    ];
    for (const err of errors) {
      expect(err).toBeInstanceOf(GatewayError);
      expect(err).toBeInstanceOf(Error);
    }
  });
});
