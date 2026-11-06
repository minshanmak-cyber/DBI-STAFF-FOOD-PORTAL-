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
      <div className="inline-flex items-center space-x-2 bg-[#F4F0FD] border border-[#35118F]/20 text-[#35118F] text-xs px-3 py-1.5 rounded-lg font-medium">
        <Clock className="w-3.5 h-3.5 text-[#35118F] shrink-0" />
        <span className="font-semibold">Opens at 9:00 AM IST</span>
        <span className="text-[#35118F]/40">•</span>
        <span className="text-[#35118F]/80 font-normal">Window: 9:00 AM – 3:00 PM</span>
      </div>
    );
  }

  // If between 9:00 AM and 3:00 PM IST
  if (allowed) {
    return (
      <div className="inline-flex items-center space-x-2 bg-[#EEFBF6] border border-[#12B98A]/30 text-[#0C7A5B] text-xs px-3 py-1.5 rounded-lg font-medium">
        <CheckCircle className="w-3.5 h-3.5 text-[#12B98A] shrink-0" />
        <span className="font-semibold">Submissions Open</span>
        <span className="text-[#12B98A]/40">•</span>
        <span className="text-[#0C7A5B]/80 font-normal">Closes today at 3:00 PM IST</span>
      </div>
    );
  }

  // If after 3:00 PM IST
  return (
    <div className="inline-flex items-center space-x-2 bg-[#FEF9ED] border border-[#F5B51B]/40 text-[#946200] text-xs px-3 py-1.5 rounded-lg font-medium">
      <AlertTriangle className="w-3.5 h-3.5 text-[#F5B51B] shrink-0" />
      <span className="font-semibold">Submissions Closed</span>
      <span className="text-[#F5B51B]/40">•</span>
      <span className="text-[#946200]/80 font-normal">Cutoff was 3:00 PM IST</span>
    </div>
  );
}
