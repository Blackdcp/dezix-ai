import { NextRequest } from "next/server";
import { processCompletionRequest } from "@/lib/gateway";
import type { ChatCompletionRequest } from "@/lib/gateway/types";
import { GatewayError, invalidRequestError } from "@/lib/gateway/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      const err = invalidRequestError("Invalid JSON in request body");
      return new Response(JSON.stringify(err.toJSON()), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization");
    const requestIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    return await processCompletionRequest(
      body as ChatCompletionRequest,
      authHeader,
      requestIp
    );
  } catch (err) {
    if (err instanceof GatewayError) {
      return new Response(JSON.stringify(err.toJSON()), {
        status: err.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[API] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal server error",
          type: "internal_error",
          param: null,
          code: "internal_error",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
