"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  QrCode,
  History,
  AlertCircle,
  Loader2,
  Calendar,
  HelpCircle,
  Coffee,
  Utensils,
  CookingPot,
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
  const userDetails = parseDepartmentAndRole(user?.department, user?.role);

  const renderMealBadge = (status: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE") => {
    if (status === "OPT_IN") {
      return (
        <span className="badge-success">
          <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
          <span>Requested</span>
        </span>
      );
    }
    if (status === "OPT_OUT") {
      return (
        <span className="badge-neutral">
          <XCircle className="w-3.5 h-3.5 text-[#6A6577]" />
          <span>Opted Out</span>
        </span>
      );
    }
    return (
      <span className="badge-warning">
        <HelpCircle className="w-3.5 h-3.5 text-[#F5B51B]" />
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
          <div>
            <div className="flex items-center space-x-1.5 text-[#6A6577] text-xs font-medium uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#35118F]" />
              <span>Target Service Date</span>
            </div>
            <h2 className="text-lg font-semibold text-[#24212D] mt-0.5">
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
            className={`mt-5 p-3.5 rounded-lg flex items-start space-x-2.5 text-xs ${
              feedback.type === "success"
                ? "bg-[#EEFBF6] border border-[#12B98A]/30 text-[#0C7A5B]"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-[#12B98A] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
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
                    <div className="w-8 h-8 rounded-lg bg-[#F6F5FA] border border-[#E5E2EE] flex items-center justify-center text-[#35118F]">
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
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    breakfast === "OPT_IN"
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#24212D] border border-[#E5E2EE] hover:border-[#35118F]/40"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setBreakfast("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    breakfast === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
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
                    <div className="w-8 h-8 rounded-lg bg-[#F6F5FA] border border-[#E5E2EE] flex items-center justify-center text-[#35118F]">
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
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    lunch === "OPT_IN"
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#24212D] border border-[#E5E2EE] hover:border-[#35118F]/40"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setLunch("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    lunch === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
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
                    <div className="w-8 h-8 rounded-lg bg-[#F6F5FA] border border-[#E5E2EE] flex items-center justify-center text-[#35118F]">
                      <CookingPot className="w-4 h-4 text-[#35118F]" />
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
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    dinner === "OPT_IN"
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#24212D] border border-[#E5E2EE] hover:border-[#35118F]/40"
                  } disabled:opacity-50`}
                >
                  Request Meal
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setDinner("OPT_OUT")}
                  className={`h-9 px-3 text-xs font-medium rounded-lg transition-all ${
                    dinner === "OPT_OUT"
                      ? "bg-[#24212D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE] hover:text-red-700 hover:border-red-200"
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#F5B51B]" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-[#12B98A]" />
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
