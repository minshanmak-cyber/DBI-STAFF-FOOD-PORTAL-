"use client";

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
      <div className="inline-flex items-center text-xs sm:text-sm">
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
      <div className="inline-flex items-center text-xs sm:text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-[#12B98A] shrink-0 mr-2" />
        <span className="font-semibold text-[#1A162B]">Submissions open</span>
        <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
        <span className="text-[#4A4557]">Closes today at 3:00 PM IST</span>
      </div>
    );
  }

  // If after 3:00 PM IST (Submissions Closed)
  return (
    <div className="inline-flex items-center text-xs sm:text-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B51B] shrink-0 mr-2" />
      <span className="font-semibold text-[#1A162B]">Submissions closed</span>
      <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
      <span className="text-[#4A4557]">Cutoff was 3:00 PM IST</span>
    </div>
  );
}
