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
  Lock,
  ArrowRight,
  Sparkles,
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
      <div className="flex items-center justify-center py-20 text-[#6A6577]">
        <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
        <span className="text-sm">Loading staff portal...</span>
      </div>
    );
  }

  const isLocked = !data?.eligibility.allowed;

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
      {/* ========================================================= */}
      {/* 1. COMPACT STAFF WELCOME SECTION (Requirement 5)          */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#E5E2EE] rounded-xl px-5 py-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24212D] tracking-tight">
              Welcome, {user?.fullName || "Staff Member"}
            </h1>
            <span className="badge-purple hidden sm:inline-flex">Staff Portal</span>
          </div>
          <p className="text-xs text-[#6A6577] mt-1">
            Staff ID: <span className="font-mono text-[#35118F] font-semibold">{user?.staffId}</span>
            {user?.department && ` • Department: ${user.department}`}
          </p>
        </div>

        {/* Compact Quick Access Links in Header (Requirement 9) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/staff/qr"
            className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5"
            title="View today's collection QR passes"
          >
            <QrCode className="w-3.5 h-3.5 text-[#35118F]" />
            <span>My QR Codes</span>
          </Link>
          <Link
            href="/staff/history"
            className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5"
            title="View previous meal attendance and history"
          >
            <History className="w-3.5 h-3.5 text-[#6A6577]" />
            <span>Meal History</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEPARATE NEXT SERVICE DATE & DEADLINE (Requirement 6)  */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E5E2EE] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Target Service Date */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#F4F0FD] border border-[#35118F]/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#35118F]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6A6577] block">
                Target Service Date
              </span>
              <div className="text-base sm:text-lg font-semibold text-[#24212D] mt-0.5">
                {data?.serviceDateDisplay || "Tomorrow"}
              </div>
            </div>
          </div>

          {/* Submission Deadline & Countdown Status */}
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6A6577] block mb-1">
              Submission Cutoff Window
            </span>
            {data && (
              <DeadlineBadge
                allowed={data.eligibility.allowed}
                status={data.eligibility.status}
                deadlineDisplay={data.eligibility.deadlineDisplay}
                openingDisplay={data.eligibility.openingDisplay}
              />
            )}
          </div>
        </div>

        {/* Locked explanation alert when window is closed */}
        {isLocked && (
          <div className="mt-4 pt-3.5 border-t border-[#E5E2EE] flex items-start gap-2.5 text-xs text-[#946200] bg-[#FEF9ED] p-3 rounded-lg border border-[#F5B51B]/40">
            <AlertCircle className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#24212D]">Selection Window Locked: </span>
              {data?.eligibility.reason ||
                "Submissions are accepted strictly between 9:00 AM and 3:00 PM IST on the day preceding the meal date. For late corrections, please contact your Administrator."}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. MEAL SELECTION SECTION WITH 3 HORIZONTAL CARDS         */}
      {/* (Requirement 7 & Requirement 8)                           */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E5E2EE] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="pb-4 border-b border-[#E5E2EE] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#24212D]">
              Meal Attendance Preferences
            </h2>
            <p className="text-xs text-[#6A6577] mt-0.5">
              Choose your attendance for each service window below.
            </p>
          </div>
          {isLocked && (
            <span className="badge-warning">
              <Lock className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>Editing Locked</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 3 Horizontal Meal Selection Cards */}
          <div className="space-y-3.5">
            {/* Breakfast Horizontal Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                breakfast === "OPT_IN"
                  ? "bg-[#F4F0FD]/40 border-[#35118F] ring-1 ring-[#35118F]/25 shadow-xs"
                  : breakfast === "OPT_OUT"
                  ? "bg-[#F6F5FA]/70 border-[#E5E2EE]"
                  : "bg-white border-[#E5E2EE] hover:border-[#D5C4F5]"
              } ${isLocked ? "opacity-75 bg-[#FAFAFC]" : ""}`}
            >
              {/* Left: Icon, Meal Name, Timings & State Text */}
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#FEF9ED] text-[#946200] border border-[#F5B51B]/30 flex items-center justify-center shrink-0">
                  <SunMedium className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-[#24212D] text-base">Breakfast</h3>
                    <span className="text-xs text-[#6A6577]">• Morning Service (8:00 AM – 9:30 AM)</span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    {breakfast === "OPT_IN" ? (
                      <span className="text-[#0C7A5B] font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
                        Meal requested. QR collection pass will be activated for tomorrow.
                      </span>
                    ) : breakfast === "OPT_OUT" ? (
                      <span className="text-[#6A6577] flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#6A6577]" />
                        Explicitly opted out. No food prepared for this slot.
                      </span>
                    ) : (
                      <span className="text-[#946200] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#F5B51B]" />
                        Unanswered (treated as out by default).
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Badge & Segmented Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E2EE]">
                <div>{renderMealBadge(breakfast)}</div>

                <div className="inline-flex p-1 bg-[#F6F5FA] border border-[#E5E2EE] rounded-lg gap-1">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setBreakfast("OPT_IN")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      breakfast === "OPT_IN"
                        ? "bg-[#35118F] text-white shadow-xs font-semibold"
                        : "text-[#24212D] hover:text-[#35118F] hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Request Meal
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setBreakfast("OPT_OUT")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      breakfast === "OPT_OUT"
                        ? "bg-[#24212D] text-white shadow-xs font-semibold"
                        : "text-[#6A6577] hover:text-red-700 hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Opt Out
                  </button>
                </div>
              </div>
            </div>

            {/* Lunch Horizontal Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                lunch === "OPT_IN"
                  ? "bg-[#F4F0FD]/40 border-[#35118F] ring-1 ring-[#35118F]/25 shadow-xs"
                  : lunch === "OPT_OUT"
                  ? "bg-[#F6F5FA]/70 border-[#E5E2EE]"
                  : "bg-white border-[#E5E2EE] hover:border-[#D5C4F5]"
              } ${isLocked ? "opacity-75 bg-[#FAFAFC]" : ""}`}
            >
              {/* Left: Icon, Meal Name, Timings & State Text */}
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] border border-[#12B98A]/30 flex items-center justify-center shrink-0">
                  <Sunset className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-[#24212D] text-base">Lunch</h3>
                    <span className="text-xs text-[#6A6577]">• Afternoon Service (12:30 PM – 2:00 PM)</span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    {lunch === "OPT_IN" ? (
                      <span className="text-[#0C7A5B] font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
                        Meal requested. QR collection pass will be activated for tomorrow.
                      </span>
                    ) : lunch === "OPT_OUT" ? (
                      <span className="text-[#6A6577] flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#6A6577]" />
                        Explicitly opted out. No food prepared for this slot.
                      </span>
                    ) : (
                      <span className="text-[#946200] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#F5B51B]" />
                        Unanswered (treated as out by default).
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Badge & Segmented Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E2EE]">
                <div>{renderMealBadge(lunch)}</div>

                <div className="inline-flex p-1 bg-[#F6F5FA] border border-[#E5E2EE] rounded-lg gap-1">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setLunch("OPT_IN")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      lunch === "OPT_IN"
                        ? "bg-[#35118F] text-white shadow-xs font-semibold"
                        : "text-[#24212D] hover:text-[#35118F] hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Request Meal
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setLunch("OPT_OUT")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      lunch === "OPT_OUT"
                        ? "bg-[#24212D] text-white shadow-xs font-semibold"
                        : "text-[#6A6577] hover:text-red-700 hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Opt Out
                  </button>
                </div>
              </div>
            </div>

            {/* Dinner Horizontal Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                dinner === "OPT_IN"
                  ? "bg-[#F4F0FD]/40 border-[#35118F] ring-1 ring-[#35118F]/25 shadow-xs"
                  : dinner === "OPT_OUT"
                  ? "bg-[#F6F5FA]/70 border-[#E5E2EE]"
                  : "bg-white border-[#E5E2EE] hover:border-[#D5C4F5]"
              } ${isLocked ? "opacity-75 bg-[#FAFAFC]" : ""}`}
            >
              {/* Left: Icon, Meal Name, Timings & State Text */}
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#F4F0FD] text-[#35118F] border border-[#35118F]/20 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-[#24212D] text-base">Dinner</h3>
                    <span className="text-xs text-[#6A6577]">• Night Service (7:30 PM – 9:00 PM)</span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    {dinner === "OPT_IN" ? (
                      <span className="text-[#0C7A5B] font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
                        Meal requested. QR collection pass will be activated for tomorrow.
                      </span>
                    ) : dinner === "OPT_OUT" ? (
                      <span className="text-[#6A6577] flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#6A6577]" />
                        Explicitly opted out. No food prepared for this slot.
                      </span>
                    ) : (
                      <span className="text-[#946200] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#F5B51B]" />
                        Unanswered (treated as out by default).
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Badge & Segmented Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E2EE]">
                <div>{renderMealBadge(dinner)}</div>

                <div className="inline-flex p-1 bg-[#F6F5FA] border border-[#E5E2EE] rounded-lg gap-1">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setDinner("OPT_IN")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      dinner === "OPT_IN"
                        ? "bg-[#35118F] text-white shadow-xs font-semibold"
                        : "text-[#24212D] hover:text-[#35118F] hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Request Meal
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setDinner("OPT_OUT")}
                    className={`h-8 px-3.5 text-xs font-medium rounded-md transition-all ${
                      dinner === "OPT_OUT"
                        ? "bg-[#24212D] text-white shadow-xs font-semibold"
                        : "text-[#6A6577] hover:text-red-700 hover:bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Opt Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. BOTTOM-RIGHT ALIGNED SAVE ACTION (Requirement 8)       */}
          {/* ========================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-[#E5E2EE]">
            {/* Left: Feedback or informative message */}
            <div className="text-xs text-[#6A6577] order-2 sm:order-1">
              {feedback ? (
                <span
                  className={
                    feedback.type === "success"
                      ? "text-[#0C7A5B] font-medium"
                      : "text-red-700 font-medium"
                  }
                >
                  {feedback.message}
                </span>
              ) : isLocked ? (
                <span className="text-[#946200] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#F5B51B]" />
                  Submission cutoff passed (3:00 PM IST). Preferences are locked.
                </span>
              ) : (
                <span>
                  Please confirm and save your choices before 3:00 PM IST.
                </span>
              )}
            </div>

            {/* Right: Save Button Aligned to Bottom-Right */}
            <div className="order-1 sm:order-2 w-full sm:w-auto">
              {isLocked ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto h-10 px-5 text-xs font-medium rounded-lg bg-slate-100 text-[#6A6577] border border-[#E5E2EE] cursor-not-allowed flex items-center justify-center gap-2"
                  title="Submissions closed for tomorrow's service date"
                >
                  <Lock className="w-3.5 h-3.5 text-[#6A6577]" />
                  <span>Submissions Closed</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full sm:w-auto h-10 px-6 text-xs font-medium shadow-xs flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F5B51B]" />
                      <span>Saving Choices...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#12B98A]" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* 5. COMPACT QUICK-ACCESS CARDS (Requirement 9)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/staff/qr"
          className="bg-white border border-[#E5E2EE] hover:border-[#35118F]/40 rounded-xl p-4 flex items-center justify-between transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#F4F0FD] text-[#35118F] border border-[#35118F]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#24212D] group-hover:text-[#35118F] transition-colors">
                My QR Collection Passes
              </div>
              <div className="text-xs text-[#6A6577] mt-0.5">
                View & download active meal passes for canteen counter verification
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6A6577] group-hover:text-[#35118F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>

        <Link
          href="/staff/history"
          className="bg-white border border-[#E5E2EE] hover:border-[#35118F]/40 rounded-xl p-4 flex items-center justify-between transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] border border-[#12B98A]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#24212D] group-hover:text-[#35118F] transition-colors">
                Attendance & Meal History
              </div>
              <div className="text-xs text-[#6A6577] mt-0.5">
                Review your previous meal requests, opt-outs and collections
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6A6577] group-hover:text-[#35118F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </Link>
      </div>
    </div>
  );
}
