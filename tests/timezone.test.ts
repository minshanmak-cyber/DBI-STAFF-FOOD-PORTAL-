import { describe, it, expect } from "vitest";
import {
  checkStaffMealEditEligibility,
  getNextServiceDate,
  getTodayServiceDate,
  getCutoffForServiceDate,
  formatDateToISO,
} from "@/lib/timezone";

describe("Timezone & Cutoff Logic (Asia/Kolkata 9:00 AM to 3:00 PM IST Window)", () => {
  const serviceDate = "2026-11-05"; // Next-day service date
  // Window on cutoff day (2026-11-04): 09:00:00 to 15:00:00 IST

  it("calculates correct cutoff date, opening time and deadline display strings", () => {
    const { cutoffDateString, displayOpening, displayDeadline } = getCutoffForServiceDate(serviceDate);
    expect(cutoffDateString).toBe("2026-11-04");
    expect(displayOpening).toContain("2026-11-04 at 9:00 AM IST");
    expect(displayDeadline).toContain("2026-11-04 at 3:00 PM IST");
  });

  it("blocks edits BEFORE 9:00 AM IST on cutoff day (e.g. 8:30 AM IST)", () => {
    // 2026-11-04 08:30:00 IST is 2026-11-04 03:00:00 UTC
    const beforeOpen = new Date("2026-11-04T03:00:00.000Z");
    const result = checkStaffMealEditEligibility(serviceDate, beforeOpen);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("NOT_OPEN");
    expect(result.reason).toContain("open at 9:00 AM IST");
  });

  it("allows edits BETWEEN 9:00 AM and 3:00 PM IST on cutoff day (controllable clock)", () => {
    // 2026-11-04 10:00:00 IST is 2026-11-04 04:30:00 UTC
    const midMorning = new Date("2026-11-04T04:30:00.000Z");
    const result1 = checkStaffMealEditEligibility(serviceDate, midMorning);
    expect(result1.allowed).toBe(true);
    expect(result1.status).toBe("OPEN");

    // 2026-11-04 14:59:00 IST is 2026-11-04 09:29:00 UTC
    const beforeCutoff = new Date("2026-11-04T09:29:00.000Z");
    const result2 = checkStaffMealEditEligibility(serviceDate, beforeCutoff);
    expect(result2.allowed).toBe(true);
    expect(result2.status).toBe("OPEN");
    expect(result2.reason).toBeUndefined();
  });

  it("blocks edits EXACTLY at 3:00 PM IST on cutoff day", () => {
    // 2026-11-04 15:00:00 IST is 2026-11-04 09:30:00 UTC
    const atCutoff = new Date("2026-11-04T09:30:00.000Z");
    const result = checkStaffMealEditEligibility(serviceDate, atCutoff);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("CLOSED");
    expect(result.reason).toContain("Deadline has passed");
  });

  it("blocks edits AFTER 3:00 PM IST on cutoff day", () => {
    // 2026-11-04 15:05:00 IST is 2026-11-04 09:35:00 UTC
    const afterCutoff = new Date("2026-11-04T09:35:00.000Z");
    const result = checkStaffMealEditEligibility(serviceDate, afterCutoff);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("CLOSED");
    expect(result.reason).toContain("Deadline has passed");
  });

  it("blocks edits on the service day itself", () => {
    // 2026-11-05 08:00:00 IST
    const onServiceDay = new Date("2026-11-05T02:30:00.000Z");
    const result = checkStaffMealEditEligibility(serviceDate, onServiceDay);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe("CLOSED");
  });

  it("computes next service date correctly based on reference date", () => {
    // Reference: 2026-11-04 10:00:00 IST
    const ref = new Date("2026-11-04T04:30:00.000Z");
    expect(getTodayServiceDate(ref)).toBe("2026-11-04");
    expect(getNextServiceDate(ref)).toBe("2026-11-05");
  });
});
