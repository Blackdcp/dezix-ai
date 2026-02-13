import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/gateway/auth";
import { getModelWhitelist } from "@/lib/gateway/auth";
import { GatewayError } from "@/lib/gateway/errors";
import type { ModelsListResponse, ModelObject } from "@/lib/gateway/types";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    // Authenticate
    const { apiKey } = await authenticateRequest(authHeader);

    // Get model whitelist for this key
    const whitelist = await getModelWhitelist(apiKey.id);

    // Fetch all active models
    const models = await db.model.findMany({
      where: { isActive: true },
      orderBy: { modelId: "asc" },
    });

    // Filter by whitelist if set
    const filtered =
      whitelist.length > 0
        ? models.filter((m) => whitelist.includes(m.modelId))
        : models;

    const data: ModelObject[] = filtered.map((m) => ({
      id: m.modelId,
      object: "model" as const,
      created: Math.floor(m.createdAt.getTime() / 1000),
      owned_by: m.providerId,
    }));

    const response: ModelsListResponse = {
      object: "list",
      data,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof GatewayError) {
      return new Response(JSON.stringify(err.toJSON()), {
        status: err.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[API] Models list error:", err);
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
