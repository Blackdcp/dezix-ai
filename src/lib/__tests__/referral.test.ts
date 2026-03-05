import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    systemConfig: { findUnique: vi.fn() },
    $queryRaw: vi.fn(),
    transaction: { create: vi.fn().mockResolvedValue({}) },
    referralReward: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import { processReferralCommission } from "../referral";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

describe("processReferralCommission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing if user has no referrer", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: null } as never);

    await processReferralCommission("user-1", 100);

    expect(db.$queryRaw).not.toHaveBeenCalled();
    expect(db.transaction.create).not.toHaveBeenCalled();
  });

  it("does nothing if user not found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null as never);

    await processReferralCommission("nonexistent", 100);

    expect(db.$queryRaw).not.toHaveBeenCalled();
  });

  it("uses default 10% rate if systemConfig not found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { balance: new Prisma.Decimal("110.00") },
    ] as never);

    await processReferralCommission("user-1", 100);

    // 100 * 0.1 = 10.00 commission
    expect(db.transaction.create).toHaveBeenCalledOnce();
    const txCall = vi.mocked(db.transaction.create).mock.calls[0][0];
    expect(Number(txCall.data.amount)).toBe(10);
    expect(txCall.data.userId).toBe("referrer-1");
    expect(txCall.data.type).toBe("REFERRAL");
  });

  it("uses custom commission rate from systemConfig", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockResolvedValue({ key: "referral_commission_rate", value: "0.2" } as never);
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { balance: new Prisma.Decimal("120.00") },
    ] as never);

    await processReferralCommission("user-1", 50);

    // 50 * 0.2 = 10.00
    const txCall = vi.mocked(db.transaction.create).mock.calls[0][0];
    expect(Number(txCall.data.amount)).toBe(10);
  });

  it("creates referralReward record", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { balance: new Prisma.Decimal("110.00") },
    ] as never);

    await processReferralCommission("user-1", 100);

    expect(db.referralReward.create).toHaveBeenCalledOnce();
    const call = vi.mocked(db.referralReward.create).mock.calls[0][0];
    expect(call.data.userId).toBe("referrer-1");
    expect(call.data.fromUserId).toBe("user-1");
    expect(Number(call.data.amount)).toBe(10);
  });

  it("skips if commission rounds to zero", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockResolvedValue({ key: "referral_commission_rate", value: "0.001" } as never);

    await processReferralCommission("user-1", 0.001);

    // 0.001 * 0.001 = 0.000001, rounds to 0
    expect(db.$queryRaw).not.toHaveBeenCalled();
  });

  it("skips if referrer not found in UPDATE RETURNING", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.$queryRaw).mockResolvedValue([] as never);

    await processReferralCommission("user-1", 100);

    expect(db.transaction.create).not.toHaveBeenCalled();
  });

  it("does not throw if DB error occurs (silent catch)", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ referredBy: "referrer-1" } as never);
    vi.mocked(db.systemConfig.findUnique).mockRejectedValue(new Error("DB down"));

    await expect(
      processReferralCommission("user-1", 100)
    ).resolves.toBeUndefined();
  });
});
