import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, { status: string; latency: number }> = {};

  // PostgreSQL check
  try {
    const start = Date.now();
    await db.$executeRaw`SELECT 1`;
    checks.postgres = { status: "healthy", latency: Date.now() - start };
  } catch {
    checks.postgres = { status: "unhealthy", latency: 0 };
  }

  // Redis check
  try {
    const start = Date.now();
    await redis.ping();
    checks.redis = { status: "healthy", latency: Date.now() - start };
  } catch {
    checks.redis = { status: "unhealthy", latency: 0 };
  }

  const allHealthy = Object.values(checks).every(
    (c) => c.status === "healthy"
  );

  return new Response(
    JSON.stringify({
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp,
      checks,
    }),
    {
      status: allHealthy ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
