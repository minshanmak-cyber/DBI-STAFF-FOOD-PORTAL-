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
  X,
} from "lucide-react";
import FoodLoadingState from "@/components/FoodLoader";

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
    if (!overrideTarget || !reason.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/responses", {
        method: "PATCH",
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
        setFeedback({ type: "error", message: data.error || "Failed to record override." });
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
        <span className="badge-success">
          <CheckCircle className="w-3 h-3 text-[#12B98A]" />
          <span>Opt-In</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="badge-neutral">
          <XCircle className="w-3 h-3 text-[#6A6577]" />
          <span>Opt-Out</span>
        </span>
      );
    }
    return (
      <span className="badge-warning">
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
      {/* Header & Date Selector Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-stretch gap-3 sm:gap-3.5">
          <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6A6577] mb-0.5">
              Corrections & Overrides
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
              Staff Meal Response Matrix
            </h1>
            <p className="text-xs text-[#6A6577] mt-1">
              Service Date: <span className="font-semibold text-[#35118F]">{serviceDateDisplay}</span> • Unresponded staff default to Out
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#F6F5FA] px-3 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-[#35118F] shrink-0" />
          <span className="text-xs font-semibold text-[#24212D]">Target Date:</span>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-xs text-[#24212D] font-medium focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-2.5 text-xs shadow-xs ${
            feedback.type === "success"
              ? "bg-[#EEFBF6] text-[#0C7A5B]"
              : "bg-red-50 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-[#12B98A] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6A6577]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Staff ID, Name, or Department..."
          className="form-input pl-10 rounded-xl"
        />
      </div>

      {/* Responses Table Card */}
      {loading ? (
        <FoodLoadingState
          title="Loading staff meal responses..."
          subtitle="Fetching submission matrix for target service date"
          showText
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9FD] border-b border-[#F1EFF7] text-[11px] font-bold uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Staff ID</th>
                  <th className="px-5 sm:px-6 py-3.5">Full Name</th>
                  <th className="px-5 sm:px-6 py-3.5">Department</th>
                  <th className="px-5 sm:px-6 py-3.5 text-center">Breakfast</th>
                  <th className="px-5 sm:px-6 py-3.5 text-center">Lunch</th>
                  <th className="px-5 sm:px-6 py-3.5 text-center">Dinner</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFF7]">
                {filtered.map((row) => (
                  <tr key={row.userId} className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-4 font-mono font-bold text-[#35118F]">
                      {row.staffId}
                    </td>
                    <td className="px-5 sm:px-6 py-4 font-medium text-[#1A162B]">
                      {row.fullName}
                      {!row.hasResponded && (
                        <span className="block text-[11px] text-[#946200] font-normal">
                          Did not submit
                        </span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[#6A6577]">{row.department || "—"}</td>

                    {/* Breakfast cell */}
                    <td className="px-5 sm:px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.breakfast)}
                        <button
                          onClick={() => handleOpenOverride(row, "BREAKFAST", row.breakfast)}
                          title="Override Breakfast"
                          className="btn-icon h-7 w-7 text-[#6A6577] hover:text-[#35118F]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Lunch cell */}
                    <td className="px-5 sm:px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.lunch)}
                        <button
                          onClick={() => handleOpenOverride(row, "LUNCH", row.lunch)}
                          title="Override Lunch"
                          className="btn-icon h-7 w-7 text-[#6A6577] hover:text-[#35118F]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Dinner cell */}
                    <td className="px-5 sm:px-6 py-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {renderStatusBadge(row.dinner)}
                        <button
                          onClick={() => handleOpenOverride(row, "DINNER", row.dinner)}
                          title="Override Dinner"
                          className="btn-icon h-7 w-7 text-[#6A6577] hover:text-[#35118F]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 sm:px-6 py-4 text-xs text-[#6A6577] font-mono text-right">
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
        <div className="fixed inset-0 z-50 bg-[#24212D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1EFF7]">
              <div>
                <h3 className="text-base font-bold text-[#1A162B]">
                  Late Response Correction
                </h3>
                <span className="text-xs text-[#6A6577]">
                  {overrideTarget.user.staffId} ({overrideTarget.user.fullName}) •{" "}
                  {overrideTarget.mealType}
                </span>
              </div>
              <button
                onClick={() => setOverrideTarget(null)}
                className="btn-icon"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOverride} className="mt-4 space-y-4">
              <div>
                <label className="form-label">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="form-input rounded-xl"
                >
                  <option value="OPT_IN">OPT_IN (Request Meal)</option>
                  <option value="OPT_OUT">OPT_OUT (Cancel / Decline)</option>
                  <option value="NO_RESPONSE">NO_RESPONSE (Reset to Unanswered)</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Mandatory Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Staff called duty desk; roster change by HR supervisor."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#F8F7FC] text-[#24212D] placeholder-[#9D98A8] focus:bg-white focus:ring-2 focus:ring-[#35118F]/20 focus:outline-none transition-all"
                />
                <span className="form-helper">
                  This reason will be permanently recorded in the institutional audit log.
                </span>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="btn-secondary h-9 px-4 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 5}
                  className="btn-primary h-9 px-4 rounded-xl text-xs font-bold"
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
