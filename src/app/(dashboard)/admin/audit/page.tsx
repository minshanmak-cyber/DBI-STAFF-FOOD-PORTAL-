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
          <h1 className="text-2xl font-semibold text-[#24212D] tracking-tight">System Audit Trail</h1>
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
            className="form-input pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Loading audit history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2EE] rounded-xl p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-[#6A6577]/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#24212D]">No Audit Events Found</h3>
          <p className="text-xs text-[#6A6577] mt-1">Events will appear here as actions are performed.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E2EE] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7FC] border-b border-[#E5E2EE] text-xs font-medium uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-5 py-3">Timestamp (IST)</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Reason / Notes</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EE]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-[#6A6577] whitespace-nowrap">
                      {log.createdAt}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      <div>{log.actorName}</div>
                      <span className="text-[11px] font-mono text-[#35118F]">
                        {log.actorStaffId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-xs text-[#24212D] max-w-xs leading-relaxed">
                      {log.reason || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-mono text-[#6A6577] max-w-sm truncate text-right">
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

