import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: "blue" | "emerald" | "amber" | "rose" | "slate" | "purple" | "teal" | "yellow";
}

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  badge,
  badgeColor = "slate",
}: StatCardProps) {
  const badgeClasses = {
    blue: "bg-[#F4F0FD] text-[#35118F] border-[#E9E1FA]",
    purple: "bg-[#F4F0FD] text-[#35118F] border-[#E9E1FA]",
    emerald: "bg-[#EEFBF6] text-[#0C7A5B] border-[#D2F6EA]",
    teal: "bg-[#EEFBF6] text-[#0C7A5B] border-[#D2F6EA]",
    amber: "bg-[#FEF9ED] text-[#A87508] border-[#FDEFCD]",
    yellow: "bg-[#FEF9ED] text-[#A87508] border-[#FDEFCD]",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    slate: "bg-[#F6F5FA] text-[#24212D] border-[#E5E2EE]",
  }[badgeColor];

  return (
    <div className="bg-white border border-[#E5E2EE] rounded-2xl p-5 shadow-xs transition hover:border-[#D5C4F5]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6A6577]">
          {label}
        </span>
        {icon && <div className="text-[#6A6577]">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-[#24212D] tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-[#6A6577] mt-2">{subtext}</p>}
    </div>
  );
}

