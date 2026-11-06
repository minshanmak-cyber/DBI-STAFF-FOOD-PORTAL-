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
    blue: "badge-purple",
    purple: "badge-purple",
    emerald: "badge-success",
    teal: "badge-success",
    amber: "badge-warning",
    yellow: "badge-warning",
    rose: "badge-danger",
    slate: "badge-neutral",
  }[badgeColor];

  return (
    <div className="bg-white border border-[#E5E2EE] rounded-xl p-5 shadow-xs transition-colors hover:border-[#D5C4F5]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#6A6577]">
          {label}
        </span>
        {icon && <div className="text-[#6A6577] shrink-0">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2.5">
        <span className="text-2xl font-semibold text-[#24212D] tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-[#6A6577] mt-2 leading-relaxed">{subtext}</p>}
    </div>
  );
}

