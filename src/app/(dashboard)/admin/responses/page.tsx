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
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#0C7A5B] bg-[#EEFBF6] border border-[#12B98A]/30 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-[#12B98A]" />
          <span>Opt-In</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-medium text-[#6A6577] bg-[#F6F5FA] border border-[#E5E2EE] px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3 text-[#6A6577]" />
          <span>Opt-Out</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 text-xs font-medium text-[#B88204] bg-[#FEF9ED] border border-[#F5B51B]/30 px-2 py-0.5 rounded-full">
        <HelpCircle className="w-3 h-3 text-[#F5B51B]" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E2EE] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#24212D]">Staff Meal Response Matrix</h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Service Date: <span className="font-semibold text-[#35118F]">{serviceDateDisplay}</span> • Unresponded staff default to Out
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F6F5FA] p-2 rounded-xl border border-[#E5E2EE]">
          <Calendar className="w-4 h-4 text-[#35118F]" />
          <span className="text-xs font-semibold text-[#24212D]">Date:</span>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-[#E5E2EE] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#35118F] bg-white text-[#24212D]"
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            feedback.type === "success"
              ? "bg-[#EEFBF6] border border-[#12B98A]/30 text-[#0C7A5B]"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-[#12B98A] flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6A6577]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Staff ID, Name, or Department..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E2EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35118F] bg-white text-[#24212D] placeholder-[#6A6577]"
        />
      </div>

      {/* Responses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Loading responses...</span>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E2EE] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F5FA] border-b border-[#E5E2EE] text-xs font-semibold uppercase tracking-wider text-[#6A6577]">
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
              <tbody className="divide-y divide-[#E5E2EE]/60">
                {filtered.map((row) => (
                  <tr key={row.userId} className="hover:bg-[#F6F5FA]/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-[#35118F]">
                      {row.staffId}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#24212D]">
                      {row.fullName}
                      {!row.hasResponded && (
                        <span className="block text-[10px] text-[#F5B51B] font-semibold">
                          Did not submit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6A6577]">{row.department || "—"}</td>

                    {/* Breakfast cell */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.breakfast)}
                        <button
                          onClick={() => handleOpenOverride(row, "BREAKFAST", row.breakfast)}
                          title="Override Breakfast"
                          className="p-1 text-[#6A6577] hover:text-[#35118F] hover:bg-[#F4F0FD] rounded-lg transition"
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
                          className="p-1 text-[#6A6577] hover:text-[#35118F] hover:bg-[#F4F0FD] rounded-lg transition"
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
                          className="p-1 text-[#6A6577] hover:text-[#35118F] hover:bg-[#F4F0FD] rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#6A6577] font-mono">
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
        <div className="fixed inset-0 z-50 bg-[#24212D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#E5E2EE]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2EE]">
              <div>
                <h3 className="text-base font-bold text-[#24212D]">
                  Late Response Correction
                </h3>
                <span className="text-xs text-[#6A6577]">
                  {overrideTarget.user.staffId} ({overrideTarget.user.fullName}) •{" "}
                  {overrideTarget.mealType}
                </span>
              </div>
              <button
                onClick={() => setOverrideTarget(null)}
                className="text-[#6A6577] hover:text-[#24212D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#24212D]">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-[#E5E2EE] rounded-xl bg-white text-[#24212D] focus:ring-[#35118F]"
                >
                  <option value="OPT_IN">OPT_IN (Request Meal)</option>
                  <option value="OPT_OUT">OPT_OUT (Cancel / Decline)</option>
                  <option value="NO_RESPONSE">NO_RESPONSE (Reset to Unanswered)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#24212D]">
                  Mandatory Audit Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Staff called duty desk; roster change by HR supervisor."
                  className="mt-1 block w-full px-3 py-2 text-sm border border-[#E5E2EE] rounded-xl text-[#24212D] focus:ring-[#35118F]"
                />
                <span className="text-[11px] text-[#6A6577] mt-1 block">
                  This reason will be permanently recorded in the institutional audit log.
                </span>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6A6577] hover:bg-[#F6F5FA] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 5}
                  className="px-5 py-2 bg-[#35118F] text-white text-xs font-semibold rounded-xl hover:bg-[#2a0d72] shadow-xs transition disabled:opacity-50"
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

