import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addDays, parseISO, subDays } from "date-fns";

export const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";
export const OPENING_HOUR_IST = 9; // 9:00 AM IST
export const OPENING_MINUTE_IST = 0;
export const DEADLINE_HOUR_IST = 15; // 3:00 PM IST
export const DEADLINE_MINUTE_IST = 0;

/**
 * Get current time in the application timezone (Asia/Kolkata by default).
 */
export function getNowInIST(customDate?: Date): Date {
  const base = customDate || new Date();
  return toZonedTime(base, TIMEZONE);
}

/**
 * Format a Date object to YYYY-MM-DD string in the application timezone.
 */
export function formatDateToISO(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}

/**
 * Returns today's service date in YYYY-MM-DD based on Asia/Kolkata.
 */
export function getTodayServiceDate(referenceDate?: Date): string {
  const now = referenceDate || new Date();
  return formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd");
}

/**
 * Returns next day's service date in YYYY-MM-DD based on Asia/Kolkata.
 * (This is the primary target date for staff meal selections)
 */
export function getNextServiceDate(referenceDate?: Date): string {
  const now = referenceDate || new Date();
  const istDate = toZonedTime(now, TIMEZONE);
  const nextDay = addDays(istDate, 1);
  return formatInTimeZone(nextDay, TIMEZONE, "yyyy-MM-dd");
}

/**
 * Calculates the exact opening time (9:00 AM IST) and cutoff deadline (3:00 PM IST)
 * on the day preceding serviceDate.
 */
export function getCutoffForServiceDate(serviceDate: string): {
  cutoffDateString: string;
  openingISOString: string;
  cutoffISOString: string;
  displayOpening: string;
  displayDeadline: string;
} {
  // serviceDate is "YYYY-MM-DD"
  const serviceDay = parseISO(serviceDate);
  const cutoffDay = subDays(serviceDay, 1);
  const cutoffDateString = formatInTimeZone(cutoffDay, TIMEZONE, "yyyy-MM-dd");
  
  // Selection opens at 09:00:00 IST on cutoffDay
  const openingISOString = `${cutoffDateString}T09:00:00+05:30`;
  const displayOpening = `${cutoffDateString} at 9:00 AM IST`;

  // Cutoff happens at 15:00:00 IST on cutoffDay
  const cutoffISOString = `${cutoffDateString}T15:00:00+05:30`;
  const displayDeadline = `${cutoffDateString} at 3:00 PM IST`;

  return {
    cutoffDateString,
    openingISOString,
    cutoffISOString,
    displayOpening,
    displayDeadline,
  };
}

export type SubmissionStatus = "NOT_OPEN" | "OPEN" | "CLOSED";

/**
 * Checks whether staff can still edit their meal response for a given service date.
 * Staff submit preferences for the NEXT DAY.
 * Submission window is strictly 9:00 AM to 3:00 PM IST on the day prior to service date.
 * - Before 9:00 AM IST: Not yet open.
 * - 9:00 AM to 3:00 PM IST: Open for opt-in / opt-out / edits.
 * - At or after 3:00 PM IST: Locked / Closed.
 */
export function checkStaffMealEditEligibility(
  serviceDate: string,
  referenceDate?: Date
): {
  allowed: boolean;
  status: SubmissionStatus;
  reason?: string;
  deadlineDisplay: string;
  openingDisplay: string;
} {
  const now = referenceDate || new Date();
  const { cutoffDateString, openingISOString, cutoffISOString, displayOpening, displayDeadline } =
    getCutoffForServiceDate(serviceDate);
  
  const openingTime = new Date(openingISOString).getTime();
  const cutoffTime = new Date(cutoffISOString).getTime();
  const currentTime = now.getTime();

  // If before 9:00 AM IST on submission day
  if (currentTime < openingTime) {
    return {
      allowed: false,
      status: "NOT_OPEN",
      reason: `Submissions for this service date open at 9:00 AM IST on ${cutoffDateString}. Window: 9:00 AM – 3:00 PM.`,
      deadlineDisplay: displayDeadline,
      openingDisplay: displayOpening,
    };
  }

  // If at or after 3:00 PM IST on cutoff day (or on service day)
  if (currentTime >= cutoffTime) {
    return {
      allowed: false,
      status: "CLOSED",
      reason: `Deadline has passed (${displayDeadline}). Responses are locked.`,
      deadlineDisplay: displayDeadline,
      openingDisplay: displayOpening,
    };
  }

  // Inside 9:00 AM - 3:00 PM IST window
  return {
    allowed: true,
    status: "OPEN",
    deadlineDisplay: displayDeadline,
    openingDisplay: displayOpening,
  };
}

/**
 * Formats a timestamp into readable IST representation.
 */
export function formatIST(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, TIMEZONE, "dd MMM yyyy, hh:mm a 'IST'");
}

/**
 * Formats a service date (YYYY-MM-DD) into readable format, e.g. "Thursday, 05 Nov 2026".
 */
export function formatServiceDateDisplay(serviceDate: string): string {
  try {
    const d = parseISO(serviceDate);
    return formatInTimeZone(d, TIMEZONE, "EEEE, dd MMM yyyy");
  } catch {
    return serviceDate;
  }
}
