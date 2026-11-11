"use client";

import { Clock } from "lucide-react";

interface DeadlineBadgeProps {
  allowed: boolean;
  status?: "NOT_OPEN" | "OPEN" | "CLOSED";
  deadlineDisplay: string;
  openingDisplay?: string;
  className?: string;
}

/**
 * Formats deadline string from e.g. "2026-11-11 at 3:00 PM IST"
 * into friendly format "11 Nov 2026 at 3:00 PM IST".
 */
export function formatDeadlineDisplay(str: string): string {
  if (!str) return "";
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
  if (match) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const y = match[1];
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const rest = match[4];
    return `${d} ${months[m]} ${y}${rest}`;
  }
  return str;
}

export default function DeadlineBadge({
  allowed,
  status,
  deadlineDisplay,
  openingDisplay,
  className = "",
}: DeadlineBadgeProps) {
  // If not yet 9:00 AM IST
  if (status === "NOT_OPEN" || (!allowed && status !== "CLOSED" && openingDisplay)) {
    return (
      <div className={`inline-flex items-center text-xs sm:text-sm ${className}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#35118F] shrink-0 mr-2" />
        <span className="font-semibold text-[#1A162B]">Opens at 9:00 AM</span>
        <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
        <span className="text-[#4A4557]">Window: 9:00 AM – 3:00 PM IST</span>
      </div>
    );
  }

  // If between 9:00 AM and 3:00 PM IST (Submissions Open)
  if (allowed) {
    return (
      <div className={`inline-flex items-center text-xs sm:text-sm ${className}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#12B98A] shrink-0 mr-2" />
        <span className="font-semibold text-[#1A162B]">Submissions open</span>
        <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
        <span className="text-[#4A4557]">Closes today at 3:00 PM IST</span>
      </div>
    );
  }

  // If after 3:00 PM IST (Deadline Passed) - Clean human-like layout matching design
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        <Clock className="w-4 h-4 text-[#D97706] shrink-0 stroke-[2.2]" />
        <span className="font-bold text-[#78350F]">Deadline passed</span>
        <span className="text-[#D2CEE0] mx-0.5">|</span>
        <span className="text-[#1A162B] font-medium">
          {formatDeadlineDisplay(deadlineDisplay)}
        </span>
      </div>
      <p className="text-xs text-[#555062] pl-5.5 sm:pl-6 mt-0.5 leading-normal">
        Responses are now closed for this service date.
      </p>
    </div>
  );
}
