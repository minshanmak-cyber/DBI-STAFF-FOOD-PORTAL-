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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Meal Selection</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Personal Meal History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your past meal opt-in choices and verified collection records.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
          <span>Loading meal logs...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Historical Records</h3>
          <p className="text-xs text-slate-500 mt-1">
            You haven't submitted any meal responses yet.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4">Service Date</th>
                  <th className="px-6 py-4">Meal</th>
                  <th className="px-6 py-4">Preference</th>
                  <th className="px-6 py-4">Collection Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.serviceDateDisplay}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {row.mealType}
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "OPT_IN" ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Requested</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Opted Out</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {row.collected ? (
                        <div>
                          <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Collected</span>
                          </span>
                          {row.collectedAt && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              {row.collectedAt}
                            </div>
                          )}
                        </div>
                      ) : row.status === "OPT_IN" ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Pending Collection</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
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

