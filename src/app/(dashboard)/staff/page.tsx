"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle,
  XCircle,
  QrCode,
  History,
  AlertCircle,
  Loader2,
  Calendar,
  Coffee,
  Utensils,
} from "lucide-react";
import DeadlineBadge from "@/components/DeadlineBadge";

function ClocheIcon({ className = "w-4 h-4 text-[#35118F]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 7a2 2 0 1 1 4 0" />
      <path d="M4 17a8 8 0 0 1 16 0" />
      <line x1="2" y1="18" x2="22" y2="18" />
    </svg>
  );
}

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
  role?: string;
  department?: string | null;
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const parseDepartmentAndRole = (deptStr?: string | null, role?: string) => {
  if (!deptStr) {
    return {
      department: null,
      role: role ? toTitleCase(role) : "Staff",
    };
  }

  if (deptStr.includes("•")) {
    const [dept, desig] = deptStr.split("•").map((s) => s.trim());
    return {
      department: dept || null,
      role: desig ? toTitleCase(desig) : (role ? toTitleCase(role) : "Staff"),
    };
  }

  return {
    department: deptStr,
    role: role ? toTitleCase(role) : "Staff",
  };
};

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
          message: "Your next-day preferences have been updated successfully.",
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
  const userDetails = parseDepartmentAndRole(user?.department, user?.role);

  const renderMealBadge = (status: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE") => {
    if (status === "OPT_IN") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#EEFBF6] text-[#0C7A5B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12B98A]" />
          <span>Requested</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6F5FA] text-[#6A6577]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6A6577]" />
          <span>Opted Out</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FEF6E9] text-[#92400E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E88C1E]" />
        <span>Not Responded</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E5E2EE] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs sm:text-sm font-medium text-[#6A6577] mb-1">
            Staff Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
            Welcome, {user?.fullName || "Staff Member"}
          </h1>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#4A4557] mt-2 gap-y-1">
            <span>
              Staff ID: <strong className="font-bold text-[#1A162B]">{user?.staffId}</strong>
            </span>
            {userDetails.department && (
              <>
                <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
                <span>
                  Department: <span className="font-medium text-[#1A162B]">{userDetails.department}</span>
                </span>
              </>
            )}
            {userDetails.role && (
              <>
                <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
                <span>
                  Role: <span className="font-medium text-[#1A162B]">{userDetails.role}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/staff/qr"
            className="btn-primary h-9 px-3.5 text-xs"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5" />
            <span>My QR Passes</span>
          </Link>
          <Link
            href="/staff/history"
            className="btn-secondary h-9 px-3.5 text-xs"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-[#6A6577]" />
            <span>Meal History</span>
          </Link>
        </div>
      </div>

      {/* Next Day Meal Selection Section */}
      <div className="bg-white border border-[#E5E2EE] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E5E2EE]">
          <div className="flex items-stretch gap-3 sm:gap-3.5">
            <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5 text-[#555062] text-xs sm:text-sm font-medium">
                <Calendar className="w-4 h-4 text-[#35118F]" />
                <span>Target service date</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A162B] tracking-tight mt-0.5">
                {data?.serviceDateDisplay || "Tomorrow"}
              </h2>
            </div>
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
            className={`mt-5 rounded-xl border relative overflow-hidden flex items-center p-3.5 sm:px-4 text-xs sm:text-sm shadow-2xs ${
              feedback.type === "success"
                ? "bg-[#F0FDF8] border-[#D7F3E8]"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                feedback.type === "success" ? "bg-[#0C7A5B]" : "bg-red-600"
              }`}
            />
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-1">
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 text-[#0C7A5B] shrink-0 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className={`font-semibold ${feedback.type === "success" ? "text-[#1A162B]" : "text-red-900"}`}>
                {feedback.type === "success" ? "Meal preferences saved" : "Error saving preferences"}
              </span>
              <span className={feedback.type === "success" ? "text-[#C5DCD4] hidden sm:inline" : "text-red-300 hidden sm:inline"}>
                |
              </span>
              <span className={feedback.type === "success" ? "text-[#555062]" : "text-red-700"}>
                {feedback.message}
              </span>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="mt-5 p-3.5 bg-[#FEF9ED] border border-[#F5B51B]/30 rounded-lg text-xs text-[#946200] flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-[#F5B51B] shrink-0" />
            <span>
              {data?.eligibility.reason ||
                "Submissions are accepted strictly between 9:00 AM and 3:00 PM IST on the day preceding the meal date. For late corrections, please contact your Administrator."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Breakfast Card */}
            <div
              className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                breakfast === "OPT_IN"
                  ? "border-[#35118F] ring-1 ring-[#35118F]/20 bg-[#F4F0FD]/30"
                  : breakfast === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]/60"
                  : "border-[#E5E2EE] bg-white hover:border-[#D5C4F5]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#35118F]">
                      <Coffee className="w-4 h-4 text-[#35118F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#24212D] text-sm">Breakfast</h3>
                      <span className="text-xs text-[#6A6577]">Morning service</span>
                    </div>
                  </div>
                  {renderMealBadge(breakfast)}
                </div>

                <p className="text-xs text-[#6A6577] mt-2 mb-4 leading-relaxed">
                  {breakfast === "OPT_IN"
                    ? "Meal requested. QR pass will be active."
                    : breakfast === "OPT_OUT"
                    ? "Explicitly declined."
                    : "Unanswered (treated as out)."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setBreakfast("OPT_IN")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    breakfast === "OPT_OUT"
                      ? "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:border-[#35118F]/40"
                      : "bg-[#35118F] text-white hover:bg-[#2B0D75] shadow-xs"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setBreakfast("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    breakfast === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
                  } disabled:opacity-50`}
                >
                  Opt Out
                </button>
              </div>
            </div>

            {/* Lunch Card */}
            <div
              className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                lunch === "OPT_IN"
                  ? "border-[#35118F] ring-1 ring-[#35118F]/20 bg-[#F4F0FD]/30"
                  : lunch === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]/60"
                  : "border-[#E5E2EE] bg-white hover:border-[#D5C4F5]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#35118F]">
                      <Utensils className="w-4 h-4 text-[#35118F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#24212D] text-sm">Lunch</h3>
                      <span className="text-xs text-[#6A6577]">Afternoon service</span>
                    </div>
                  </div>
                  {renderMealBadge(lunch)}
                </div>

                <p className="text-xs text-[#6A6577] mt-2 mb-4 leading-relaxed">
                  {lunch === "OPT_IN"
                    ? "Meal requested. QR pass will be active."
                    : lunch === "OPT_OUT"
                    ? "Explicitly declined."
                    : "Unanswered (treated as out)."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLunch("OPT_IN")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    lunch === "OPT_OUT"
                      ? "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:border-[#35118F]/40"
                      : "bg-[#35118F] text-white hover:bg-[#2B0D75] shadow-xs"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLunch("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    lunch === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
                  } disabled:opacity-50`}
                >
                  Opt Out
                </button>
              </div>
            </div>

            {/* Dinner Card */}
            <div
              className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                dinner === "OPT_IN"
                  ? "border-[#35118F] ring-1 ring-[#35118F]/20 bg-[#F4F0FD]/30"
                  : dinner === "OPT_OUT"
                  ? "border-[#E5E2EE] bg-[#F6F5FA]/60"
                  : "border-[#E5E2EE] bg-white hover:border-[#D5C4F5]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#35118F]">
                      <ClocheIcon className="w-4 h-4 text-[#35118F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#24212D] text-sm">Dinner</h3>
                      <span className="text-xs text-[#6A6577]">Night service</span>
                    </div>
                  </div>
                  {renderMealBadge(dinner)}
                </div>

                <p className="text-xs text-[#6A6577] mt-2 mb-4 leading-relaxed">
                  {dinner === "OPT_IN"
                    ? "Meal requested. QR pass will be active."
                    : dinner === "OPT_OUT"
                    ? "Explicitly declined."
                    : "Unanswered (treated as out)."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E2EE]">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setDinner("OPT_IN")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    dinner === "OPT_OUT"
                      ? "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:border-[#35118F]/40"
                      : "bg-[#35118F] text-white hover:bg-[#2B0D75] shadow-xs"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setDinner("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center ${
                    dinner === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#4A4557] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
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
              className="btn-primary h-10 px-5 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                  <span>Saving preferences...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 text-white" />
                  <span>Save next-day preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
