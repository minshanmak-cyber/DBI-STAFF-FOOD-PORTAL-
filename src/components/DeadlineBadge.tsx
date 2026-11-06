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
      <div className="inline-flex items-center space-x-2 bg-[#F6F5FA] border border-[#E5E2EE] text-[#24212D] text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
        <Clock className="w-3.5 h-3.5 text-[#35118F]" />
        <span className="font-semibold text-[#35118F]">Opens at 9:00 AM IST</span>
        <span className="text-slate-300">•</span>
        <span className="text-[#6A6577] font-normal">Window: 9:00 AM – 3:00 PM</span>
      </div>
    );
  }

  // If between 9:00 AM and 3:00 PM IST
  if (allowed) {
    return (
      <div className="inline-flex items-center space-x-2 bg-[#EEFBF6] border border-[#D2F6EA] text-[#0C7A5B] text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
        <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
        <span className="font-semibold">Submissions Open</span>
        <span className="text-[#A9EDDA]">•</span>
        <span className="text-[#0EA177] font-normal">Closes at 3:00 PM IST</span>
      </div>
    );
  }

  // If after 3:00 PM IST
  return (
    <div className="inline-flex items-center space-x-2 bg-[#FEF9ED] border border-[#FDEFCD] text-[#A87508] text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
      <AlertTriangle className="w-3.5 h-3.5 text-[#F5B51B]" />
      <span className="font-semibold">Submissions Closed</span>
      <span className="text-[#FBE4A3]">•</span>
      <span className="text-[#D6990D] font-normal">Deadline: 3:00 PM IST</span>
    </div>
  );
}
