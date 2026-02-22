import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's referral code
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  // Count referred users
  const referredCount = await db.user.count({
    where: { referredBy: userId },
  });

  // Total earnings from referrals
  const totalEarnings = await db.referralReward.aggregate({
    where: { userId },
    _sum: { amount: true },
    _count: true,
  });

  // Recent rewards
  const rewards = await db.referralReward.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      fromUserId: true,
      amount: true,
      createdAt: true,
    },
  });

  // Get referred user emails for display
  const fromUserIds = rewards.map((r) => r.fromUserId);
  const fromUsers = await db.user.findMany({
    where: { id: { in: fromUserIds } },
    select: { id: true, email: true, name: true },
  });
  const fromUserMap = new Map(fromUsers.map((u) => [u.id, u]));

  return NextResponse.json({
    referralCode: user?.referralCode || null,
    referredCount,
    totalEarnings: Number(totalEarnings._sum.amount ?? 0),
    rewardCount: totalEarnings._count,
    rewards: rewards.map((r) => {
      const fromUser = fromUserMap.get(r.fromUserId);
      return {
        id: r.id,
        fromUserEmail: fromUser?.email
          ? fromUser.email.replace(/(.{2}).*(@.*)/, "$1***$2")
          : "UNKNOWN",
        amount: Number(r.amount),
        createdAt: r.createdAt,
      };
    }),
  });
}
