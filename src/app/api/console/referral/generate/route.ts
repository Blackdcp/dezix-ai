import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return NextResponse.json({ referralCode: user.referralCode });
  }

  const referralCode = crypto.randomBytes(4).toString("hex");

  await db.user.update({
    where: { id: session.user.id },
    data: { referralCode },
  });

  return NextResponse.json({ referralCode });
}
