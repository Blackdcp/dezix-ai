import { NextRequest } from "next/server";
import { processCompletionRequest } from "@/lib/gateway";
import type { ChatCompletionRequest } from "@/lib/gateway/types";
import { GatewayError, invalidRequestError, rateLimitError } from "@/lib/gateway/errors";
import { checkIpRateLimit } from "@/lib/gateway/rate-limiter";
import { addCorsHeaders, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    // IP rate limit: 60 requests/minute
    const requestIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;
    if (requestIp) {
      const { allowed } = await checkIpRateLimit(requestIp, 60);
      if (!allowed) {
        throw rateLimitError("IP rate limit exceeded: 60 requests per 60s");
      }
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      const err = invalidRequestError("Invalid JSON in request body");
      return addCorsHeaders(
        new Response(JSON.stringify(err.toJSON()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const authHeader = req.headers.get("authorization");

    const response = await processCompletionRequest(
      body as ChatCompletionRequest,
      authHeader,
      requestIp
    );
    return addCorsHeaders(response);
  } catch (err) {
    if (err instanceof GatewayError) {
      return addCorsHeaders(
        new Response(JSON.stringify(err.toJSON()), {
          status: err.statusCode,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    console.error("[API] Unhandled error:", err);
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: {
            message: "Internal server error",
            type: "internal_error",
            param: null,
            code: "internal_error",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
  }
}
