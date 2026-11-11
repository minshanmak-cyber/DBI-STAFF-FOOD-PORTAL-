"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import FoodLoadingState from "@/components/FoodLoader";

interface AuditLogItem {
  id: string;
  actorStaffId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((res) => res.json())
      .then((data) => setLogs(data.auditLogs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actorStaffId.toLowerCase().includes(q) ||
      (l.reason && l.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-stretch gap-3 sm:gap-3.5">
          <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6A6577] mb-0.5">
              Compliance & Security
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
              System Audit Trail
            </h1>
            <p className="text-xs text-[#6A6577] mt-1">
              Immutable log of administrative overrides, account modifications, and operational events.
            </p>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6A6577]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or reason..."
            className="form-input pl-10 rounded-xl"
          />
        </div>
      </div>

      {loading ? (
        <FoodLoadingState
          title="Loading audit history..."
          subtitle="Fetching verified compliance logs"
          showText
        />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <ShieldCheck className="w-10 h-10 text-[#6A6577]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1A162B]">No Audit Events Found</h3>
          <p className="text-xs text-[#6A6577] mt-1">Events will appear here as actions are performed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9FD] border-b border-[#F1EFF7] text-[11px] font-bold uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Timestamp (IST)</th>
                  <th className="px-5 sm:px-6 py-3.5">Actor</th>
                  <th className="px-5 sm:px-6 py-3.5">Action</th>
                  <th className="px-5 sm:px-6 py-3.5">Reason / Notes</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFF7]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-4 text-xs font-mono text-[#6A6577] whitespace-nowrap">
                      {log.createdAt}
                    </td>
                    <td className="px-5 sm:px-6 py-4 font-medium text-[#1A162B]">
                      <div className="font-bold">{log.actorName}</div>
                      <span className="text-[11px] font-mono font-semibold text-[#35118F]">
                        {log.actorStaffId}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span
                        className={
                          log.action.includes("OVERRIDE")
                            ? "badge-purple font-mono"
                            : log.action.includes("PASSWORD") || log.action.includes("STATUS")
                            ? "badge-warning font-mono"
                            : "badge-success font-mono"
                        }
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-xs text-[#24212D] max-w-xs leading-relaxed">
                      {log.reason || "—"}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[11px] font-mono text-[#6A6577] max-w-sm truncate text-right">
                      {log.newValue ? (
                        <div title={log.newValue} className="text-[#0C7A5B]">New: {log.newValue}</div>
                      ) : null}
                      {log.previousValue ? (
                        <div title={log.previousValue} className="text-[#6A6577]">Old: {log.previousValue}</div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
