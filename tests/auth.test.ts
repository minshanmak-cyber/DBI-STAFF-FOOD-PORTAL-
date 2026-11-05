import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";
import { checkStaffOwnershipOrAdmin } from "@/lib/auth-guard";

describe("Session & Authorization Logic", () => {
  const mockPayload = {
    userId: "usr_100",
    staffId: "EMP101",
    role: "STAFF" as const,
    mustChangePassword: false,
    fullName: "Rahul Sharma",
    department: "Engineering",
  };

  it("creates and verifies a valid signed JWT session token", async () => {
    const token = await createSessionToken(mockPayload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.staffId).toBe("EMP101");
    expect(decoded?.role).toBe("STAFF");
    expect(decoded?.fullName).toBe("Rahul Sharma");
  });

  it("returns null for tampered or invalid session token", async () => {
    const token = await createSessionToken(mockPayload);
    const tampered = token.slice(0, -6) + "abcdef";
    const decoded = await verifySessionToken(tampered);
    expect(decoded).toBeNull();
  });

  it("enforces staff ownership and IDOR prevention", () => {
    const staffSession = { ...mockPayload };
    const adminSession = { ...mockPayload, role: "ADMIN" as const, userId: "admin_1" };

    // Staff can access their own record
    expect(checkStaffOwnershipOrAdmin(staffSession, "usr_100")).toBe(true);

    // Staff CANNOT access another staff member's record
    expect(checkStaffOwnershipOrAdmin(staffSession, "usr_200")).toBe(false);

    // Admin CAN access any record
    expect(checkStaffOwnershipOrAdmin(adminSession, "usr_200")).toBe(true);
  });
});

