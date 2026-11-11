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
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-[#F4F0FD] text-[#35118F] border border-[#35118F]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35118F]" />
          <span>Upcoming</span>
        </span>
        <span className="text-[#6A6577]">
          Opens at 9:00 AM IST · Window: 9:00 AM – 3:00 PM
        </span>
      </div>
    );
  }

  // If between 9:00 AM and 3:00 PM IST
  if (allowed) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-[#EEFBF6] text-[#0C7A5B] border border-[#12B98A]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12B98A]" />
          <span>Open</span>
        </span>
        <span className="text-[#6A6577]">
          Closes today at 3:00 PM IST
        </span>
      </div>
    );
  }

  // If after 3:00 PM IST
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-[#FEF9ED] text-[#946200] border border-[#F5B51B]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5B51B]" />
        <span>Closed</span>
      </span>
      <span className="text-[#6A6577]">
        Cutoff was 3:00 PM IST
      </span>
    </div>
  );
}
