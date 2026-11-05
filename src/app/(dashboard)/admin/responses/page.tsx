"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Edit3,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Search,
  Loader2,
  X,
} from "lucide-react";

interface StaffResponseRow {
  userId: string;
  staffId: string;
  fullName: string;
  department: string;
  isActive: boolean;
  hasResponded: boolean;
  breakfast: string;
  lunch: string;
  dinner: string;
  updatedAt: string;
}

export default function AdminResponsesPage() {
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDateDisplay, setServiceDateDisplay] = useState("");
  const [responses, setResponses] = useState<StaffResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Correction Modal state
  const [overrideTarget, setOverrideTarget] = useState<{
    user: StaffResponseRow;
    mealType: "BREAKFAST" | "LUNCH" | "DINNER";
    currentStatus: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<"OPT_IN" | "OPT_OUT" | "NO_RESPONSE">("OPT_IN");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchResponses = async (dateParam?: string) => {
    setLoading(true);
    try {
      const url = dateParam
        ? `/api/admin/responses?serviceDate=${dateParam}`
        : `/api/admin/responses`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.staffResponses || []);
        setServiceDate(data.serviceDate);
        setServiceDateDisplay(data.serviceDateDisplay);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleDateChange = (date: string) => {
    setServiceDate(date);
    fetchResponses(date);
  };

  const handleOpenOverride = (
    user: StaffResponseRow,
    mealType: "BREAKFAST" | "LUNCH" | "DINNER",
    currentStatus: string
  ) => {
    setOverrideTarget({ user, mealType, currentStatus });
    setNewStatus(currentStatus === "OPT_IN" ? "OPT_OUT" : "OPT_IN");
    setReason("");
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget) return;

    if (reason.trim().length < 5) {
      setFeedback({
        type: "error",
        message: "A clear audit reason (minimum 5 characters) is mandatory for late corrections.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/responses/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: overrideTarget.user.userId,
          serviceDate,
          mealType: overrideTarget.mealType,
          status: newStatus,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to override response." });
      } else {
        setFeedback({ type: "success", message: data.message });
        setOverrideTarget(null);
        fetchResponses(serviceDate);
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error saving override." });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "OPT_IN") {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Opt-In</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3 text-slate-400" />
          <span>Opt-Out</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
        <HelpCircle className="w-3 h-3 text-amber-500" />
        <span>No Response</span>
      </span>
    );
  };

  const filtered = responses.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.staffId.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Meal Response Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">
            Service Date: <span className="font-semibold text-slate-800">{serviceDateDisplay}</span> • Unresponded staff default to Out
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Date:</span>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Staff ID, Name, or Department..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
        />
      </div>

      {/* Responses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
          <span>Loading responses...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4">Staff ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-center">Breakfast</th>
                  <th className="px-6 py-4 text-center">Lunch</th>
                  <th className="px-6 py-4 text-center">Dinner</th>
                  <th className="px-6 py-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.userId} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {row.staffId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.fullName}
                      {!row.hasResponded && (
                        <span className="block text-[10px] text-amber-600 font-normal">
                          Did not submit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.department}</td>

                    {/* Breakfast cell */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.breakfast)}
                        <button
                          onClick={() => handleOpenOverride(row, "BREAKFAST", row.breakfast)}
                          title="Override Breakfast"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Lunch cell */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.lunch)}
                        <button
                          onClick={() => handleOpenOverride(row, "LUNCH", row.lunch)}
                          title="Override Lunch"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Dinner cell */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.dinner)}
                        <button
                          onClick={() => handleOpenOverride(row, "DINNER", row.dinner)}
                          title="Override Dinner"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Override / Correction Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Late Response Correction
                </h3>
                <span className="text-xs text-slate-500">
                  {overrideTarget.user.staffId} ({overrideTarget.user.fullName}) •{" "}
                  {overrideTarget.mealType}
                </span>
              </div>
              <button
                onClick={() => setOverrideTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="OPT_IN">OPT_IN (Request Meal)</option>
                  <option value="OPT_OUT">OPT_OUT (Cancel / Decline)</option>
                  <option value="NO_RESPONSE">NO_RESPONSE (Reset to Unanswered)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Mandatory Audit Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Staff called duty desk; roster change by HR supervisor."
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  This reason will be permanently recorded in the institutional audit log.
                </span>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 5}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Apply & Log Correction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

