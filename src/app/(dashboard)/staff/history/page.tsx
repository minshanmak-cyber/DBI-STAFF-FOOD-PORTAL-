"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, Calendar } from "lucide-react";

interface HistoryItem {
  id: string;
  serviceDate: string;
  serviceDateDisplay: string;
  mealType: string;
  status: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE";
  collected: boolean;
  collectedAt: string | null;
  updatedAt: string;
}

export default function StaffHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistory(data.history);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/staff"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#6A6577] hover:text-[#35118F] mb-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Meal Selection</span>
        </Link>
        <h1 className="text-2xl font-semibold text-[#24212D] tracking-tight">Personal Meal History</h1>
        <p className="text-xs text-[#6A6577] mt-1">
          Review your past meal opt-in choices and verified collection records.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Loading meal logs...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border border-[#E5E2EE] rounded-xl p-10 text-center">
          <Calendar className="w-10 h-10 text-[#6A6577]/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#24212D]">No Historical Records</h3>
          <p className="text-xs text-[#6A6577] mt-1">
            You haven't submitted any meal responses yet.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E2EE] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7FC] border-b border-[#E5E2EE] text-xs font-medium uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-5 py-3">Service Date</th>
                  <th className="px-5 py-3">Meal</th>
                  <th className="px-5 py-3">Preference</th>
                  <th className="px-5 py-3">Collection Status</th>
                  <th className="px-5 py-3 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EE]">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      {row.serviceDateDisplay}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      {row.mealType}
                    </td>
                    <td className="px-5 py-3.5">
                      {row.status === "OPT_IN" ? (
                        <span className="badge-success">
                          <CheckCircle className="w-3 h-3 text-[#12B98A]" />
                          <span>Requested</span>
                        </span>
                      ) : (
                        <span className="badge-neutral">
                          <XCircle className="w-3 h-3 text-[#6A6577]" />
                          <span>Opted Out</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {row.collected ? (
                        <div>
                          <span className="badge-success">
                            <CheckCircle className="w-3 h-3 text-[#12B98A]" />
                            <span>Collected</span>
                          </span>
                          {row.collectedAt && (
                            <div className="text-[11px] text-[#6A6577] mt-0.5 font-mono">
                              {row.collectedAt}
                            </div>
                          )}
                        </div>
                      ) : row.status === "OPT_IN" ? (
                        <span className="badge-purple">
                          <Clock className="w-3 h-3 text-[#35118F]" />
                          <span>Pending Collection</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#6A6577]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6A6577] font-mono text-right">
                      {row.updatedAt}
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

