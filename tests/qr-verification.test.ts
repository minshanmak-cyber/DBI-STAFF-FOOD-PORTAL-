import { describe, it, expect, vi } from "vitest";
import { verifyAndCollectMeal } from "@/lib/qr";
import { prisma } from "@/lib/prisma";

describe("QR Meal Verification & Duplicate Collection Protection", () => {
  it("rejects empty or whitespace QR token with INVALID_TOKEN", async () => {
    const res = await verifyAndCollectMeal("   ", "canteen_user_1");
    expect(res.success).toBe(false);
    expect(res.status).toBe("INVALID_TOKEN");
  });

  it("handles non-existent QR token gracefully", async () => {
    // Mock prisma.$transaction to simulate token not found
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-INVALID-TOKEN-999", "canteen_user_1");
    expect(res.success).toBe(false);
    expect(res.status).toBe("INVALID_TOKEN");
  });

  it("rejects expired QR tokens with EXPIRED status", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-EXPIRED-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() - 10000), // in the past
            user: { isActive: true },
          }),
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-EXPIRED-TOKEN", "canteen_user_1");
    expect(res.success).toBe(false);
    expect(res.status).toBe("EXPIRED");
  });

  it("rejects inactive staff with STAFF_INACTIVE", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-INACTIVE-USER-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            user: { staffId: "EMP999", isActive: false, profile: null },
          }),
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-INACTIVE-USER-TOKEN", "canteen_user_1");
    expect(res.success).toBe(false);
    expect(res.status).toBe("STAFF_INACTIVE");
  });

  it("rejects staff without OPT_IN response with INELIGIBLE", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-INELIGIBLE-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            serviceDate: "2026-11-05",
            mealType: "LUNCH",
            user: { id: "usr_1", staffId: "EMP101", isActive: true, profile: null },
          }),
        },
        mealResponse: {
          findUnique: vi.fn().mockResolvedValue(null), // No opt-in
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-INELIGIBLE-TOKEN", "canteen_user_1", "2026-11-05");
    expect(res.success).toBe(false);
    expect(res.status).toBe("INELIGIBLE");
  });

  it("rejects QR codes for a different service date with DATE_MISMATCH", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-WRONG-DATE-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            serviceDate: "2026-11-05", // Tomorrow
            mealType: "LUNCH",
            user: { id: "usr_1", staffId: "EMP101", isActive: true, profile: null },
          }),
        },
      };
      return callback(txMock);
    });

    // Canteen is serving on 2026-11-04 (today)
    const res = await verifyAndCollectMeal("DBI-WRONG-DATE-TOKEN", "canteen_user_1", "2026-11-04");
    expect(res.success).toBe(false);
    expect(res.status).toBe("DATE_MISMATCH");
    expect(res.message).toContain("Service date mismatch");
  });

  it("rejects duplicate scan if meal was already collected", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-ALREADY-COLLECTED-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            serviceDate: "2026-11-05",
            mealType: "LUNCH",
            user: { id: "usr_1", staffId: "EMP101", isActive: true, profile: null },
          }),
        },
        mealResponse: {
          findUnique: vi.fn().mockResolvedValue({ status: "OPT_IN" }),
        },
        mealCollection: {
          findUnique: vi.fn().mockResolvedValue({
            id: "col_1",
            collectedAt: new Date("2026-11-05T13:00:00+05:30"),
          }),
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-ALREADY-COLLECTED-TOKEN", "canteen_user_1", "2026-11-05");
    expect(res.success).toBe(false);
    expect(res.status).toBe("ALREADY_COLLECTED");
  });

  it("handles concurrent collection collisions caught by unique constraint (P2002)", async () => {
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async () => {
      const p2002Error: any = new Error("Unique constraint failed");
      p2002Error.code = "P2002";
      throw p2002Error;
    });

    const res = await verifyAndCollectMeal("DBI-CONCURRENT-TOKEN", "canteen_user_1");
    expect(res.success).toBe(false);
    expect(res.status).toBe("ALREADY_COLLECTED");
    expect(res.message).toContain("concurrent transaction");
  });

  it("approves eligible first-time collection and records timestamp", async () => {
    const mockDate = new Date();
    vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (callback: any) => {
      const txMock = {
        qrToken: {
          findUnique: vi.fn().mockResolvedValue({
            token: "DBI-SUCCESS-TOKEN",
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            serviceDate: "2026-11-05",
            mealType: "LUNCH",
            user: {
              id: "usr_1",
              staffId: "EMP101",
              isActive: true,
              profile: { fullName: "Rahul Sharma", department: "Engineering" },
            },
          }),
        },
        mealResponse: {
          findUnique: vi.fn().mockResolvedValue({ status: "OPT_IN" }),
        },
        mealCollection: {
          findUnique: vi.fn().mockResolvedValue(null), // Not yet collected
          create: vi.fn().mockResolvedValue({
            id: "col_new",
            collectedAt: mockDate,
          }),
        },
      };
      return callback(txMock);
    });

    const res = await verifyAndCollectMeal("DBI-SUCCESS-TOKEN", "canteen_user_1", "2026-11-05");
    expect(res.success).toBe(true);
    expect(res.status).toBe("SUCCESS");
    expect(res.data?.staffId).toBe("EMP101");
    expect(res.data?.mealType).toBe("LUNCH");
  });
});

