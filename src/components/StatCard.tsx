import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: "blue" | "emerald" | "amber" | "rose" | "slate";
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
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeColor];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
    </div>
  );
}

