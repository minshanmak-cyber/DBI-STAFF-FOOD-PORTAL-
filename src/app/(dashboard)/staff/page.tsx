"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SunMedium,
  Sunset,
  Moon,
  CheckCircle,
  XCircle,
  QrCode,
  History,
  AlertCircle,
  Loader2,
  Calendar,
  HelpCircle,
} from "lucide-react";
import DeadlineBadge from "@/components/DeadlineBadge";

interface MealResponseData {
  serviceDate: string;
  serviceDateDisplay: string;
  eligibility: {
    allowed: boolean;
    status: "NOT_OPEN" | "OPEN" | "CLOSED";
    reason?: string;
    deadlineDisplay: string;
    openingDisplay?: string;
  };
  responses: {
    BREAKFAST: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE";
    LUNCH: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE";
    DINNER: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE";
  };
}

interface UserSession {
  fullName: string;
  staffId: string;
  department?: string | null;
}

export default function StaffDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [data, setData] = useState<MealResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Distinct 3-state meal selection: OPT_IN | OPT_OUT | NO_RESPONSE
  const [breakfast, setBreakfast] = useState<"OPT_IN" | "OPT_OUT" | "NO_RESPONSE">("NO_RESPONSE");
  const [lunch, setLunch] = useState<"OPT_IN" | "OPT_OUT" | "NO_RESPONSE">("NO_RESPONSE");
  const [dinner, setDinner] = useState<"OPT_IN" | "OPT_OUT" | "NO_RESPONSE">("NO_RESPONSE");

  const fetchData = async () => {
    try {
      const [meRes, mealRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/staff/meal-response"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      if (mealRes.ok) {
        const mealData = (await mealRes.json()) as MealResponseData;
        setData(mealData);
        setBreakfast(mealData.responses.BREAKFAST || "NO_RESPONSE");
        setLunch(mealData.responses.LUNCH || "NO_RESPONSE");
        setDinner(mealData.responses.DINNER || "NO_RESPONSE");
      }
    } catch (err) {
      console.error("Error loading staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/staff/meal-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceDate: data.serviceDate,
          selections: [
            { mealType: "BREAKFAST", status: breakfast },
            { mealType: "LUNCH", status: lunch },
            { mealType: "DINNER", status: dinner },
          ],
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: resData.error || "Failed to update selections.",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Next-day meal preferences saved successfully!",
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Network error while saving choices.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
        <span>Loading meal portal...</span>
      </div>
    );
  }

  const isLocked = !data?.eligibility.allowed;

  const renderMealBadge = (status: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE") => {
    if (status === "OPT_IN") {
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#EEFBF6] text-[#0C7A5B] border border-[#D2F6EA]">
          <CheckCircle className="w-3 h-3 text-[#12B98A]" />
          <span>Requested</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE]">
          <XCircle className="w-3 h-3 text-[#6A6577]" />
          <span>Opted Out</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FEF9ED] text-[#A87508] border border-[#FDEFCD]">
        <HelpCircle className="w-3 h-3 text-[#F5B51B]" />
        <span>Not Responded</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#35118F] bg-[#F4F0FD] px-2.5 py-1 rounded-md border border-[#E9E1FA]">
            Staff Portal
          </span>
          <h1 className="text-2xl font-bold text-[#24212D] mt-2">
            Welcome, {user?.fullName || "Staff Member"}
          </h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Staff ID: <span className="font-mono text-[#35118F] font-bold">{user?.staffId}</span>
            {user?.department && ` • Department: ${user.department}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/staff/qr"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <QrCode className="w-4 h-4 text-[#F5B51B]" />
            <span>My QR Passes</span>
          </Link>
          <Link
            href="/staff/history"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-[#E5E2EE] hover:bg-[#F6F5FA] text-[#24212D] rounded-xl text-xs font-semibold transition"
          >
            <History className="w-4 h-4 text-[#6A6577]" />
            <span>Meal History</span>
          </Link>
        </div>
      </div>

      {/* Next Day Meal Selection Section */}
      <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E5E2EE]">
          <div>
            <div className="flex items-center space-x-2 text-[#6A6577] text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#35118F]" />
              <span>Target Service Date</span>
            </div>
            <h2 className="text-xl font-bold text-[#24212D] mt-1">
              {data?.serviceDateDisplay || "Tomorrow"}
            </h2>
          </div>

          {data && (
            <DeadlineBadge
              allowed={data.eligibility.allowed}
              status={data.eligibility.status}
              deadlineDisplay={data.eligibility.deadlineDisplay}
              openingDisplay={data.eligibility.openingDisplay}
            />
          )}
        </div>

        {feedback && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-start space-x-3 text-sm ${
              feedback.type === "success"
                ? "bg-[#EEFBF6] border border-[#D2F6EA] text-[#0C7A5B]"
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

        {isLocked && (
          <div className="mt-6 p-4 bg-[#FEF9ED] border border-[#FDEFCD] rounded-xl text-xs text-[#A87508] flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-[#F5B51B] flex-shrink-0" />
            <span>
              {data?.eligibility.reason ||
                "Submissions are accepted strictly between 9:00 AM and 3:00 PM IST on the day preceding the meal date. For late corrections, please contact your Administrator."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Breakfast Card */}
            <div
              className={`border-2 rounded-2xl p-5 transition ${
                breakfast === "OPT_IN"
                  ? "border-[#35118F] bg-[#F4F0FD]/50 shadow-xs"
                  : breakfast === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]"
                  : "border-[#FDEFCD] bg-[#FEF9ED]/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-[#FEF9ED] text-[#F5B51B] rounded-xl">
                    <SunMedium className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#24212D] text-sm">Breakfast</h3>
                    <span className="text-[11px] text-[#6A6577]">Morning service</span>
                  </div>
                </div>
                {renderMealBadge(breakfast)}
              </div>

              <p className="text-[11px] text-[#6A6577] min-h-[1.5rem] mt-2">
                {breakfast === "OPT_IN"
                  ? "✓ Meal requested. Will generate QR pass."
                  : breakfast === "OPT_OUT"
                  ? "Explicitly declined."
                  : "Unanswered (defaults to no meal)."}
              </p>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setBreakfast("OPT_IN")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    breakfast === "OPT_IN"
                      ? "bg-[#35118F] text-white border-[#35118F] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setBreakfast("OPT_OUT")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    breakfast === "OPT_OUT"
                      ? "bg-[#24212D] text-white border-[#24212D] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Opt Out
                </button>
              </div>
            </div>

            {/* Lunch Card */}
            <div
              className={`border-2 rounded-2xl p-5 transition ${
                lunch === "OPT_IN"
                  ? "border-[#35118F] bg-[#F4F0FD]/50 shadow-xs"
                  : lunch === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]"
                  : "border-[#FDEFCD] bg-[#FEF9ED]/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-[#EEFBF6] text-[#12B98A] rounded-xl">
                    <Sunset className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#24212D] text-sm">Lunch</h3>
                    <span className="text-[11px] text-[#6A6577]">Afternoon service</span>
                  </div>
                </div>
                {renderMealBadge(lunch)}
              </div>

              <p className="text-[11px] text-[#6A6577] min-h-[1.5rem] mt-2">
                {lunch === "OPT_IN"
                  ? "✓ Meal requested. Will generate QR pass."
                  : lunch === "OPT_OUT"
                  ? "Explicitly declined."
                  : "Unanswered (defaults to no meal)."}
              </p>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLunch("OPT_IN")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    lunch === "OPT_IN"
                      ? "bg-[#35118F] text-white border-[#35118F] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLunch("OPT_OUT")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    lunch === "OPT_OUT"
                      ? "bg-[#24212D] text-white border-[#24212D] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Opt Out
                </button>
              </div>
            </div>

            {/* Dinner Card */}
            <div
              className={`border-2 rounded-2xl p-5 transition ${
                dinner === "OPT_IN"
                  ? "border-[#35118F] bg-[#F4F0FD]/50 shadow-xs"
                  : dinner === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]"
                  : "border-[#FDEFCD] bg-[#FEF9ED]/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-[#F4F0FD] text-[#35118F] rounded-xl">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#24212D] text-sm">Dinner</h3>
                    <span className="text-[11px] text-[#6A6577]">Night service</span>
                  </div>
                </div>
                {renderMealBadge(dinner)}
              </div>

              <p className="text-[11px] text-[#6A6577] min-h-[1.5rem] mt-2">
                {dinner === "OPT_IN"
                  ? "✓ Meal requested. Will generate QR pass."
                  : dinner === "OPT_OUT"
                  ? "Explicitly declined."
                  : "Unanswered (defaults to no meal)."}
              </p>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setDinner("OPT_IN")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    dinner === "OPT_IN"
                      ? "bg-[#35118F] text-white border-[#35118F] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setDinner("OPT_OUT")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                    dinner === "OPT_OUT"
                      ? "bg-[#24212D] text-white border-[#24212D] shadow-xs"
                      : "bg-white text-[#24212D] border-[#E5E2EE] hover:bg-[#F6F5FA]"
                  } disabled:opacity-50`}
                >
                  Opt Out
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#E5E2EE]">
            <button
              type="submit"
              disabled={isLocked || submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F5B51B]" />
                  <span>Saving Selections...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-[#12B98A]" />
                  <span>Save Next-Day Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
