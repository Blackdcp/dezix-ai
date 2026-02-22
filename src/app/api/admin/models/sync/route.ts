import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { syncUpstreamModels } from "@/lib/sync-models";

/**
 * GET /api/admin/models/sync — Preview sync (dry run)
 * Returns diff without making changes
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Find qiniu provider (the upstream provider)
  const provider = await db.provider.findFirst({
    where: { name: "qiniu", isActive: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "No active upstream provider found" }, { status: 404 });
  }

  try {
    const result = await syncUpstreamModels(provider.id, true);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/models/sync — Execute sync
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const provider = await db.provider.findFirst({
    where: { name: "qiniu", isActive: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "No active upstream provider found" }, { status: 404 });
  }

  try {
    const result = await syncUpstreamModels(provider.id, false);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
