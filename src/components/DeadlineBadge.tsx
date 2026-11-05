"use client";

import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DeadlineBadgeProps {
  allowed: boolean;
  status?: "NOT_OPEN" | "OPEN" | "CLOSED";
  deadlineDisplay: string;
  openingDisplay?: string;
}

export default function DeadlineBadge({
  allowed,
  status,
  deadlineDisplay,
  openingDisplay,
}: DeadlineBadgeProps) {
  // If not yet 9:00 AM IST
  if (status === "NOT_OPEN" || (!allowed && status !== "CLOSED" && openingDisplay)) {
    return (
      <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200 text-sky-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
        <Clock className="w-3.5 h-3.5 text-sky-600" />
        <span>Opens at 9:00 AM IST</span>
        <span className="text-sky-300">•</span>
        <span className="text-sky-700 font-normal">Window: 9:00 AM – 3:00 PM</span>
      </div>
    );
  }

  // If between 9:00 AM and 3:00 PM IST
  if (allowed) {
    return (
      <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Submissions Open</span>
        <span className="text-emerald-300">•</span>
        <span className="text-emerald-700 font-normal">Closes at 3:00 PM IST</span>
      </div>
    );
  }

  // If after 3:00 PM IST
  return (
    <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span>Submissions Closed</span>
      <span className="text-amber-300">•</span>
      <span className="text-amber-800 font-normal">Deadline was: 3:00 PM IST</span>
    </div>
  );
}
