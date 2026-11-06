"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Loader2 } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24212D]">System Audit Trail</h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Immutable log of administrative overrides, account modifications, and operational events.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6A6577]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or reason..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E2EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35118F] bg-white text-[#24212D] placeholder-[#6A6577]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Loading audit history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2EE] rounded-2xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-[#6A6577]/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#24212D]">No Audit Events Found</h3>
          <p className="text-xs text-[#6A6577] mt-1">Events will appear here as actions are performed.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E2EE] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F5FA] border-b border-[#E5E2EE] text-xs font-semibold uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-6 py-4">Timestamp (IST)</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EE]/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F6F5FA]/60 transition">
                    <td className="px-6 py-4 text-xs font-mono text-[#6A6577] whitespace-nowrap">
                      {log.createdAt}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#24212D]">
                      <div>{log.actorName}</div>
                      <span className="text-[11px] font-mono text-[#35118F]">
                        {log.actorStaffId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full ${
                          log.action.includes("OVERRIDE")
                            ? "bg-[#F4F0FD] text-[#35118F] border border-[#35118F]/20"
                            : log.action.includes("PASSWORD") || log.action.includes("STATUS")
                            ? "bg-[#FEF9ED] text-[#B88204] border border-[#F5B51B]/30"
                            : "bg-[#EEFBF6] text-[#0C7A5B] border border-[#12B98A]/30"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#24212D] max-w-xs">
                      {log.reason || "—"}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-[#6A6577] max-w-sm truncate">
                      {log.newValue ? (
                        <div title={log.newValue} className="text-[#0C7A5B]">New: {log.newValue}</div>
                      ) : null}
                      {log.previousValue ? (
                        <div title={log.previousValue} className="text-[#6A6577]">Prev: {log.previousValue}</div>
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

