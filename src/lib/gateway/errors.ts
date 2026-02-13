export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly param?: string
  ) {
    super(message);
    this.name = "GatewayError";
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        type: this.code,
        param: this.param ?? null,
        code: this.code,
      },
    };
  }
}

// Pre-defined error factories

export function authenticationError(message = "Invalid API key") {
  return new GatewayError(message, "invalid_api_key", 401);
}

export function rateLimitError(message = "Rate limit exceeded") {
  return new GatewayError(message, "rate_limit_exceeded", 429);
}

export function insufficientBalanceError(
  message = "Insufficient balance. Please top up your account."
) {
  return new GatewayError(message, "insufficient_balance", 402);
}

export function modelNotFoundError(model: string) {
  return new GatewayError(
    `Model '${model}' not found or not available`,
    "model_not_found",
    404,
    "model"
  );
}

export function modelNotAllowedError(model: string) {
  return new GatewayError(
    `Your API key does not have access to model '${model}'`,
    "model_not_allowed",
    403,
    "model"
  );
}

export function noAvailableChannelError(model: string) {
  return new GatewayError(
    `No available channel for model '${model}'. Please try again later.`,
    "no_available_channel",
    503,
    "model"
  );
}

export function invalidRequestError(message: string, param?: string) {
  return new GatewayError(message, "invalid_request_error", 400, param);
}

export function upstreamError(message = "Upstream provider error") {
  return new GatewayError(message, "upstream_error", 502);
}

export function internalError(message = "Internal server error") {
  return new GatewayError(message, "internal_error", 500);
}
