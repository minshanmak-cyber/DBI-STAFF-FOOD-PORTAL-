import { describe, it, expect } from "vitest";
import {
  LoginSchema,
  ChangePasswordSchema,
  CreateUserSchema,
  AdminOverrideMealResponseSchema,
  SubmitMealPreferencesSchema,
} from "@/lib/validations";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from "@/lib/rate-limit";

describe("Validation Schemas & Security Rules", () => {
  it("validates LoginSchema requirements", () => {
    expect(LoginSchema.safeParse({ staffId: "EMP101", password: "SecretPassword1" }).success).toBe(true);
    expect(LoginSchema.safeParse({ staffId: "A", password: "pwd" }).success).toBe(false); // min 2 chars
    expect(LoginSchema.safeParse({ staffId: "EMP101", password: "" }).success).toBe(false);
  });

  it("enforces password complexity in ChangePasswordSchema", () => {
    // Missing number
    expect(
      ChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "PasswordOnly",
        confirmPassword: "PasswordOnly",
      }).success
    ).toBe(false);

    // Missing uppercase
    expect(
      ChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "password123",
        confirmPassword: "password123",
      }).success
    ).toBe(false);

    // Mismatched confirmation
    expect(
      ChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "ValidPassword1",
        confirmPassword: "ValidPassword2",
      }).success
    ).toBe(false);

    // Valid
    expect(
      ChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "StrongPassword99",
        confirmPassword: "StrongPassword99",
      }).success
    ).toBe(true);
  });

  it("enforces unique/valid staffId format in CreateUserSchema", () => {
    expect(
      CreateUserSchema.safeParse({
        staffId: "EMP-200_A",
        fullName: "Test User",
        department: "Finance",
        role: "STAFF",
        initialPassword: "InitialPassword123",
      }).success
    ).toBe(true);

    // Disallowed special chars
    expect(
      CreateUserSchema.safeParse({
        staffId: "EMP#200!",
        fullName: "Test User",
        role: "STAFF",
        initialPassword: "InitialPassword123",
      }).success
    ).toBe(false);
  });

  it("requires mandatory >=5 character reason for AdminOverrideMealResponseSchema", () => {
    expect(
      AdminOverrideMealResponseSchema.safeParse({
        userId: "user_123",
        serviceDate: "2026-11-05",
        mealType: "LUNCH",
        status: "OPT_IN",
        reason: "Duty roster reassignment approved by supervisor",
      }).success
    ).toBe(true);

    // Reason too short
    expect(
      AdminOverrideMealResponseSchema.safeParse({
        userId: "user_123",
        serviceDate: "2026-11-05",
        mealType: "LUNCH",
        status: "OPT_IN",
        reason: "Late",
      }).success
    ).toBe(false);
  });

  it("locks out user after 5 failed login attempts", () => {
    const testId = "RATE_TEST_EMP99";
    resetLoginRateLimit(testId);

    for (let i = 0; i < 4; i++) {
      const res = recordFailedLoginAttempt(testId);
      expect(res.isBlocked).toBe(false);
      expect(res.remainingAttempts).toBe(4 - i);
    }

    // 5th attempt triggers lockout
    const fifth = recordFailedLoginAttempt(testId);
    expect(fifth.isBlocked).toBe(true);
    expect(fifth.remainingAttempts).toBe(0);

    // Subsequent check is blocked
    const check = checkLoginRateLimit(testId);
    expect(check.isBlocked).toBe(true);
    expect(check.retryAfterSeconds).toBeGreaterThan(0);

    // Reset works
    resetLoginRateLimit(testId);
    expect(checkLoginRateLimit(testId).isBlocked).toBe(false);
  });
});

