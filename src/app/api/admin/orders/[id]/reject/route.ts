import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminRejectOrderSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = adminRejectOrderSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "INVALID_PARAMS";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Atomic: only update if PENDING
  const result = await db.$executeRaw`
    UPDATE topup_orders
    SET status = 'REJECTED',
        "adminId" = ${session!.user.id},
        "adminRemark" = ${parsed.data.adminRemark},
        "updatedAt" = NOW()
    WHERE id = ${id} AND status = 'PENDING'
  `;

  if (result === 0) {
    return NextResponse.json(
      { error: "ORDER_NOT_PENDING" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
