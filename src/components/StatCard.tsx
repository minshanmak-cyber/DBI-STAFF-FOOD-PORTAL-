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
    <div className="bg-white rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6A6577]">
          {label}
        </span>
        {icon && <div className="p-2 rounded-xl bg-[#F6F5FA] text-[#35118F] shrink-0">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-[#6A6577] mt-2.5 leading-relaxed">{subtext}</p>}
    </div>
  );
}

