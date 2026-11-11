"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Coffee,
  Utensils,
  CookingPot,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  XCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import FoodLoadingState from "@/components/FoodLoader";

interface CountsData {
  serviceDate: string;
  serviceDateDisplay: string;
  totalActiveStaff: number;
  respondedCount: number;
  noResponseCount: number;
  meals: {
    breakfast: { requested: number; optOut: number; collected: number; pending: number };
    lunch: { requested: number; optOut: number; collected: number; pending: number };
    dinner: { requested: number; optOut: number; collected: number; pending: number };
  };
}

interface UserSession {
  fullName: string;
  staffId: string;
  role?: string;
  department?: string | null;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [data, setData] = useState<CountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const getTodayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    } catch (err) {
      console.error("Failed to load user info", err);
    }
  };

  const fetchCounts = async (dateParam?: string) => {
    setLoading(true);
    try {
      const url = dateParam ? `/api/admin/counts?serviceDate=${dateParam}` : `/api/admin/counts`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!selectedDate) setSelectedDate(json.serviceDate);
      }
    } catch (err) {
      console.error("Failed to fetch admin food counts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCounts();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchCounts(newDate);
  };

  // Aggregated calculations
  const totalMealsRequested = data
    ? data.meals.breakfast.requested + data.meals.lunch.requested + data.meals.dinner.requested
    : 0;
  const totalMealsCollected = data
    ? data.meals.breakfast.collected + data.meals.lunch.collected + data.meals.dinner.collected
    : 0;
  const totalMealsPending = data
    ? data.meals.breakfast.pending + data.meals.lunch.pending + data.meals.dinner.pending
    : 0;
  const totalMealsOptOut = data
    ? data.meals.breakfast.optOut + data.meals.lunch.optOut + data.meals.dinner.optOut
    : 0;
  const overallCollectionRate =
    totalMealsRequested > 0 ? Math.round((totalMealsCollected / totalMealsRequested) * 100) : 0;
  const staffParticipationRate =
    data && data.totalActiveStaff > 0
      ? Math.round((data.respondedCount / data.totalActiveStaff) * 100)
      : 0;

  const todayStr = getTodayISO();
  const tomorrowStr = getTomorrowISO();

  return (
    <div className="space-y-6">
      {/* 1. Welcome / Operations Banner (Matching Staff Portal Design Language) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs sm:text-sm font-medium text-[#6A6577] mb-1">
            Administrator Console • Kitchen Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
            Food Production & Live Operations
          </h1>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#4A4557] mt-2 gap-y-1">
            <span>
              Administrator:{" "}
              <strong className="font-bold text-[#1A162B]">
                {user?.fullName || "DBI Admin"}
              </strong>
            </span>
            <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
            <span>
              Staff ID:{" "}
              <span className="font-mono font-medium text-[#1A162B]">
                {user?.staffId || "Admin"}
              </span>
            </span>
          </div>
        </div>

        {/* Quick Portal Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/staff" className="btn-secondary h-9 px-3.5 text-xs">
            <Users className="w-3.5 h-3.5 mr-1.5 text-[#6A6577]" />
            <span>Staff Directory</span>
          </Link>
          <Link href="/admin/responses" className="btn-secondary h-9 px-3.5 text-xs">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-[#6A6577]" />
            <span>Responses</span>
          </Link>
          <Link
            href={`/admin/reports?serviceDate=${selectedDate || todayStr}`}
            className="btn-primary h-9 px-3.5 text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* 2. Target Service Date Selector Card (With Brand Purple Vertical Bar) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-stretch gap-3 sm:gap-3.5">
            <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5 text-[#555062] text-xs sm:text-sm font-medium">
                <Calendar className="w-4 h-4 text-[#35118F]" />
                <span>Target Service Date</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#1A162B] mt-0.5 tracking-tight">
                {data?.serviceDateDisplay || "Loading date..."}
              </div>
            </div>
          </div>

          {/* Quick Date Toggle Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDateChange(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDate === todayStr
                  ? "bg-[#35118F] text-white shadow-xs"
                  : "bg-[#F6F5FA] text-[#6A6577] hover:text-[#24212D] hover:bg-[#EAE8F2]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDateChange(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDate === tomorrowStr
                  ? "bg-[#35118F] text-white shadow-xs"
                  : "bg-[#F6F5FA] text-[#6A6577] hover:text-[#24212D] hover:bg-[#EAE8F2]"
              }`}
            >
              Tomorrow
            </button>

            {/* Custom Date Input */}
            <div className="flex items-center space-x-2 bg-[#F6F5FA] px-3 py-1.5 rounded-lg transition-colors hover:bg-[#EAE8F2]">
              <Calendar className="w-3.5 h-3.5 text-[#35118F] shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs text-[#24212D] font-medium focus:outline-none cursor-pointer"
                aria-label="Pick kitchen service date"
              />
            </div>

            {/* Manual Refresh */}
            <button
              type="button"
              onClick={() => fetchCounts(selectedDate)}
              title="Refresh live kitchen counts"
              className="p-2 rounded-lg bg-[#F6F5FA] hover:bg-[#EAE8F2] text-[#6A6577] hover:text-[#35118F] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#35118F]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body */}
      {loading ? (
        <FoodLoadingState
          title="Calculating live food counts..."
          subtitle="Aggregating responses across all departments"
          showText
        />
      ) : data ? (
        <>
          {/* Quick Production KPI Grid (Borderless, Rounded-2xl, Elevated) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Breakfast Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Breakfast
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
                    {data.meals.breakfast.requested}
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">to prepare</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                    <span className="text-[#6A6577]">Collection Progress</span>
                    <span className="text-[#0C7A5B] font-bold">
                      {data.meals.breakfast.requested > 0
                        ? Math.round(
                            (data.meals.breakfast.collected / data.meals.breakfast.requested) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#12B98A] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data.meals.breakfast.requested > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (data.meals.breakfast.collected /
                                    data.meals.breakfast.requested) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#0C7A5B] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {data.meals.breakfast.collected} collected
                </span>
                <span className="inline-flex items-center gap-1 text-[#946200] font-medium">
                  <Clock className="w-3 h-3" />
                  {data.meals.breakfast.pending} pending
                </span>
                <span className="text-[#848092] font-normal">
                  {data.meals.breakfast.optOut} out
                </span>
              </div>
            </div>

            {/* Lunch Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Lunch
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
                    {data.meals.lunch.requested}
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">to prepare</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                    <span className="text-[#6A6577]">Collection Progress</span>
                    <span className="text-[#0C7A5B] font-bold">
                      {data.meals.lunch.requested > 0
                        ? Math.round(
                            (data.meals.lunch.collected / data.meals.lunch.requested) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#12B98A] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data.meals.lunch.requested > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (data.meals.lunch.collected / data.meals.lunch.requested) * 100
                                )
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#0C7A5B] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {data.meals.lunch.collected} collected
                </span>
                <span className="inline-flex items-center gap-1 text-[#946200] font-medium">
                  <Clock className="w-3 h-3" />
                  {data.meals.lunch.pending} pending
                </span>
                <span className="text-[#848092] font-normal">
                  {data.meals.lunch.optOut} out
                </span>
              </div>
            </div>

            {/* Dinner Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Dinner
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                    <CookingPot className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
                    {data.meals.dinner.requested}
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">to prepare</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                    <span className="text-[#6A6577]">Collection Progress</span>
                    <span className="text-[#0C7A5B] font-bold">
                      {data.meals.dinner.requested > 0
                        ? Math.round(
                            (data.meals.dinner.collected / data.meals.dinner.requested) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#12B98A] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data.meals.dinner.requested > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (data.meals.dinner.collected / data.meals.dinner.requested) * 100
                                )
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#0C7A5B] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {data.meals.dinner.collected} collected
                </span>
                <span className="inline-flex items-center gap-1 text-[#946200] font-medium">
                  <Clock className="w-3 h-3" />
                  {data.meals.dinner.pending} pending
                </span>
                <span className="text-[#848092] font-normal">
                  {data.meals.dinner.optOut} out
                </span>
              </div>
            </div>

            {/* Staff Participation Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Staff Participation
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EEFBF6] text-[#12B98A] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
                    {staffParticipationRate}%
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">
                    ({data.respondedCount} of {data.totalActiveStaff})
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                    <span className="text-[#6A6577]">Response Turnout</span>
                    <span className="text-[#35118F] font-bold">{data.respondedCount} logged</span>
                  </div>
                  <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#35118F] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, staffParticipationRate)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#35118F] font-semibold">
                  {data.totalActiveStaff} total staff
                </span>
                <span className="text-[#848092] font-normal">
                  {data.noResponseCount} not submitted
                </span>
              </div>
            </div>
          </div>

          {/* 4. Kitchen Meal Breakdown Table Card (Borderless, Executive Grade) */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EFF7]">
              <div>
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#35118F] bg-[#F4F0FD] px-2 py-0.5 rounded-md">
                    Kitchen Breakdown
                  </span>
                  <span className="text-xs text-[#848092]">• Production Targets</span>
                </div>
                <h2 className="font-bold text-[#1A162B] text-base sm:text-lg tracking-tight">
                  Daily Meal Preparation & Collection Summary
                </h2>
              </div>
              <Link
                href={`/admin/reports?serviceDate=${data.serviceDate}`}
                className="btn-secondary h-8 px-3 text-xs inline-flex items-center self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#35118F]" />
                <span>Export Detailed Sheet</span>
              </Link>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6A6577] border-b border-[#F1EFF7]">
                  <tr>
                    <th className="px-5 sm:px-6 py-3.5">Meal Service</th>
                    <th className="px-5 sm:px-6 py-3.5">Opt-In (Prepare)</th>
                    <th className="px-5 sm:px-6 py-3.5">Opt-Out</th>
                    <th className="px-5 sm:px-6 py-3.5">Collected</th>
                    <th className="px-5 sm:px-6 py-3.5">Pending</th>
                    <th className="px-5 sm:px-6 py-3.5 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFF7]">
                  {/* Breakfast Row */}
                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-4 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1A162B]">Breakfast</div>
                          <div className="text-[11px] text-[#6A6577]">Morning Service • 07:30 - 09:30 AM</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-extrabold text-[#1A162B] tabular-nums text-lg">
                        {data.meals.breakfast.requested}
                      </div>
                      <div className="text-[11px] text-[#6A6577]">kitchen portions</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[#848092] tabular-nums font-medium">
                      {data.meals.breakfast.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] font-bold text-xs tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {data.meals.breakfast.collected}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF9ED] text-[#946200] font-bold text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {data.meals.breakfast.pending}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[#1A162B] tabular-nums">
                          {data.meals.breakfast.requested > 0
                            ? `${Math.round(
                                (data.meals.breakfast.collected / data.meals.breakfast.requested) *
                                  100
                              )}%`
                            : "0%"}
                        </span>
                        <div className="w-20 bg-[#F1EFF7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#12B98A] h-full rounded-full"
                            style={{
                              width: `${
                                data.meals.breakfast.requested > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (data.meals.breakfast.collected /
                                          data.meals.breakfast.requested) *
                                          100
                                      )
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Lunch Row */}
                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-4 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1A162B]">Lunch</div>
                          <div className="text-[11px] text-[#6A6577]">Afternoon Service • 12:30 - 02:30 PM</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-extrabold text-[#1A162B] tabular-nums text-lg">
                        {data.meals.lunch.requested}
                      </div>
                      <div className="text-[11px] text-[#6A6577]">kitchen portions</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[#848092] tabular-nums font-medium">
                      {data.meals.lunch.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] font-bold text-xs tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {data.meals.lunch.collected}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF9ED] text-[#946200] font-bold text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {data.meals.lunch.pending}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[#1A162B] tabular-nums">
                          {data.meals.lunch.requested > 0
                            ? `${Math.round(
                                (data.meals.lunch.collected / data.meals.lunch.requested) * 100
                              )}%`
                            : "0%"}
                        </span>
                        <div className="w-20 bg-[#F1EFF7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#12B98A] h-full rounded-full"
                            style={{
                              width: `${
                                data.meals.lunch.requested > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (data.meals.lunch.collected / data.meals.lunch.requested) *
                                          100
                                      )
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Dinner Row */}
                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-4 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                          <CookingPot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1A162B]">Dinner</div>
                          <div className="text-[11px] text-[#6A6577]">Evening Service • 07:30 - 09:30 PM</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-extrabold text-[#1A162B] tabular-nums text-lg">
                        {data.meals.dinner.requested}
                      </div>
                      <div className="text-[11px] text-[#6A6577]">kitchen portions</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[#848092] tabular-nums font-medium">
                      {data.meals.dinner.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] font-bold text-xs tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {data.meals.dinner.collected}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF9ED] text-[#946200] font-bold text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {data.meals.dinner.pending}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[#1A162B] tabular-nums">
                          {data.meals.dinner.requested > 0
                            ? `${Math.round(
                                (data.meals.dinner.collected / data.meals.dinner.requested) * 100
                              )}%`
                            : "0%"}
                        </span>
                        <div className="w-20 bg-[#F1EFF7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#12B98A] h-full rounded-full"
                            style={{
                              width: `${
                                data.meals.dinner.requested > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (data.meals.dinner.collected /
                                          data.meals.dinner.requested) *
                                          100
                                      )
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>

                {/* Table Footer: Total Aggregations */}
                <tfoot className="bg-[#FAF9FD] border-t-2 border-[#E5E2EE]">
                  <tr className="font-semibold text-[#1A162B]">
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-bold text-sm text-[#1A162B]">Daily Kitchen Total</div>
                      <div className="text-[11px] text-[#6A6577] font-normal">All 3 services combined</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <div className="font-extrabold text-xl text-[#35118F] tabular-nums">
                        {totalMealsRequested}
                      </div>
                      <div className="text-[11px] text-[#6A6577] font-normal">total meals to prepare</div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-[#848092] tabular-nums">
                      {totalMealsOptOut}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEFBF6] text-[#0C7A5B] font-bold text-xs tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {totalMealsCollected} total
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF9ED] text-[#946200] font-bold text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {totalMealsPending} total
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-[#12B98A] tabular-nums">
                          {overallCollectionRate}% total
                        </span>
                        <div className="w-20 bg-[#F1EFF7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#12B98A] h-full rounded-full"
                            style={{ width: `${Math.min(100, overallCollectionRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. Administrative Quick Actions (4-Column Modern Borderless Cards) */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                Quick Operations
              </span>
              <span className="text-xs text-[#D2CEE0]">•</span>
              <span className="text-xs text-[#848092]">Direct Access Modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Staff Management */}
              <Link
                href="/admin/staff"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#35118F] bg-[#F4F0FD] px-2 py-0.5 rounded-md">
                      {data.totalActiveStaff} Active
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1A162B] text-sm group-hover:text-[#35118F] transition-colors">
                    Staff Directory
                  </h3>
                  <p className="text-xs text-[#6A6577] mt-1.5 leading-relaxed">
                    Create accounts, manage departments, reset credentials, and toggle status.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-xs font-semibold text-[#35118F]">
                  <span>Manage Staff</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Response Corrections */}
              <Link
                href="/admin/responses"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEFBF6] text-[#12B98A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#0C7A5B] bg-[#EEFBF6] px-2 py-0.5 rounded-md">
                      {data.respondedCount} Logged
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1A162B] text-sm group-hover:text-[#12B98A] transition-colors">
                    Response Corrections
                  </h3>
                  <p className="text-xs text-[#6A6577] mt-1.5 leading-relaxed">
                    Review staff choices and apply emergency late adjustments with audit trails.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-xs font-semibold text-[#12B98A]">
                  <span>Review Submissions</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Reports & Exports */}
              <Link
                href={`/admin/reports?serviceDate=${selectedDate}`}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF9ED] text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#946200] bg-[#FEF9ED] px-2 py-0.5 rounded-md">
                      Excel / PDF
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1A162B] text-sm group-hover:text-[#D97706] transition-colors">
                    Production Reports
                  </h3>
                  <p className="text-xs text-[#6A6577] mt-1.5 leading-relaxed">
                    Export printable kitchen prep sheets in formatted Excel (.xlsx) and PDF.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-xs font-semibold text-[#D97706]">
                  <span>Export Production</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Audit Logs */}
              <Link
                href="/admin/audit"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#35118F] bg-[#F4F0FD] px-2 py-0.5 rounded-md">
                      Compliance
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1A162B] text-sm group-hover:text-[#35118F] transition-colors">
                    Audit & Security
                  </h3>
                  <p className="text-xs text-[#6A6577] mt-1.5 leading-relaxed">
                    Review immutable audit logs for verification scans, overrides, and account updates.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#F1EFF7] flex items-center justify-between text-xs font-semibold text-[#35118F]">
                  <span>View Security Logs</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
