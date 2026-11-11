"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScanLine,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  UtensilsCrossed,
  Coffee,
  Utensils,
  CookingPot,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import FoodLoadingState from "@/components/FoodLoader";

interface CanteenStats {
  serviceDate: string;
  serviceDateDisplay: string;
  meals: {
    breakfast: { requested: number; collected: number; pending: number };
    lunch: { requested: number; collected: number; pending: number };
    dinner: { requested: number; collected: number; pending: number };
  };
  totalRequested: number;
  totalCollected: number;
  totalPending: number;
}

interface UserSession {
  fullName: string;
  staffId: string;
  role?: string;
  department?: string | null;
}

export default function CanteenDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [data, setData] = useState<CanteenStats | null>(null);
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

  const todayStr = getTodayISO();
  const tomorrowStr = getTomorrowISO();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    } catch (e) {
      console.error("Failed to fetch user session", e);
    }
  };

  const fetchStats = async (dateParam?: string) => {
    setLoading(true);
    try {
      const url = dateParam ? `/api/canteen/counts?serviceDate=${dateParam}` : `/api/canteen/counts`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!selectedDate) setSelectedDate(json.serviceDate);
      }
    } catch (e) {
      console.error("Failed to load canteen counts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchStats();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchStats(newDate);
  };

  const collectionPercent =
    data && data.totalRequested > 0
      ? Math.round((data.totalCollected / data.totalRequested) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner (Matching Staff & Admin Portal Aesthetic) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs sm:text-sm font-medium text-[#6A6577] mb-1">
            Canteen Operations • Meal Distribution
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
            Meal Counter & Live Distribution
          </h1>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#4A4557] mt-2 gap-y-1">
            <span>
              Operator:{" "}
              <strong className="font-bold text-[#1A162B]">
                {user?.fullName || "Canteen Staff"}
              </strong>
            </span>
            <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
            <span>
              Staff ID:{" "}
              <span className="font-mono font-medium text-[#1A162B]">
                {user?.staffId || "Canteen"}
              </span>
            </span>
            <span className="mx-2 sm:mx-2.5 text-[#D2CEE0]">|</span>
            <span>
              Service Date:{" "}
              <span className="font-semibold text-[#35118F]">
                {data?.serviceDateDisplay || "Today"}
              </span>
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchStats(selectedDate)}
            disabled={loading}
            className="btn-secondary h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 shrink-0 whitespace-nowrap"
            title="Refresh meal counts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#35118F]" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/canteen/scan"
            className="inline-flex items-center space-x-2 h-10 px-5 bg-[#12B98A] hover:bg-[#0ea278] active:bg-[#0c7a5b] text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open QR Scanner</span>
          </Link>
        </div>
      </div>

      {/* 2. Target Date Selector Card with Vertical Accent Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-stretch gap-3 sm:gap-3.5">
            <div className="w-1 bg-[#12B98A] rounded-full self-stretch shrink-0" />
            <div>
              <div className="flex items-center space-x-1.5 text-[#555062] text-xs sm:text-sm font-medium">
                <Calendar className="w-4 h-4 text-[#12B98A]" />
                <span>Active Distribution Date</span>
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
                selectedDate === todayStr || (!selectedDate && data?.serviceDate === todayStr)
                  ? "bg-[#12B98A] text-white shadow-xs"
                  : "bg-[#F6F5FA] text-[#6A6577] hover:text-[#24212D] hover:bg-[#EAE8F2]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDateChange(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDate === tomorrowStr || data?.serviceDate === tomorrowStr
                  ? "bg-[#12B98A] text-white shadow-xs"
                  : "bg-[#F6F5FA] text-[#6A6577] hover:text-[#24212D] hover:bg-[#EAE8F2]"
              }`}
            >
              Tomorrow
            </button>

            {/* Custom Date Input */}
            <div className="flex items-center space-x-2 bg-[#F6F5FA] px-3 py-1.5 rounded-lg transition-colors hover:bg-[#EAE8F2]">
              <Calendar className="w-3.5 h-3.5 text-[#12B98A] shrink-0" />
              <input
                type="date"
                value={selectedDate || data?.serviceDate || ""}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs text-[#24212D] font-medium focus:outline-none cursor-pointer"
                aria-label="Pick service date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      {loading && !data ? (
        <FoodLoadingState
          title="Loading live canteen counts..."
          subtitle="Calculating portions and verified collections"
          showText
        />
      ) : data ? (
        <>
          {/* Daily Aggregate Stats Grid (Borderless, Rounded-2xl, Elevated) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Total Meals Booked */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Total Meals Booked
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#1A162B] tracking-tight tabular-nums">
                    {data.totalRequested}
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">total portions</span>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#F1EFF7] text-xs text-[#6A6577]">
                All 3 service windows combined
              </div>
            </div>

            {/* Total Collected */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Verified Collected
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EEFBF6] text-[#12B98A] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#12B98A] tracking-tight tabular-nums">
                    {data.totalCollected}
                  </span>
                  <span className="text-xs font-bold text-[#0C7A5B] bg-[#EEFBF6] px-2 py-0.5 rounded-md">
                    {collectionPercent}% completed
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#12B98A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, collectionPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#F1EFF7] text-xs text-[#0C7A5B] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Successfully verified via QR token</span>
              </div>
            </div>

            {/* Awaiting Collection */}
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                    Awaiting Collection
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#FEF9ED] text-[#D97706] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#946200] tracking-tight tabular-nums">
                    {data.totalPending}
                  </span>
                  <span className="text-xs font-medium text-[#6A6577]">remaining</span>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-[#F1EFF7] text-xs text-[#6A6577]">
                Pending staff collection at counter
              </div>
            </div>
          </div>

          {/* 4. Service Window Breakdown (3 Detailed Cards) */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A6577]">
                Service Window Breakdown
              </span>
              <span className="text-xs text-[#D2CEE0]">•</span>
              <span className="text-xs text-[#848092]">Meal Dispensary Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Breakfast */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A162B] text-base">Breakfast</h3>
                        <span className="text-xs text-[#6A6577]">Morning • 07:30 - 09:30 AM</span>
                      </div>
                    </div>
                    <span className="text-xs tabular-nums font-bold text-[#12B98A] bg-[#EEFBF6] px-2 py-0.5 rounded-md">
                      {data.meals.breakfast.requested > 0
                        ? `${Math.round(
                            (data.meals.breakfast.collected / data.meals.breakfast.requested) * 100
                          )}%`
                        : "0%"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
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

                  {/* Metrics List */}
                  <div className="space-y-2 border-t border-[#F1EFF7] pt-3.5 text-xs">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Booked Portions:</span>
                      <span className="font-bold text-[#1A162B] tabular-nums text-sm">
                        {data.meals.breakfast.requested}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Collected:</span>
                      <span className="font-bold text-[#12B98A] tabular-nums text-sm">
                        {data.meals.breakfast.collected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Pending:</span>
                      <span className="font-bold text-[#946200] tabular-nums text-sm">
                        {data.meals.breakfast.pending}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A162B] text-base">Lunch</h3>
                        <span className="text-xs text-[#6A6577]">Afternoon • 12:30 - 02:30 PM</span>
                      </div>
                    </div>
                    <span className="text-xs tabular-nums font-bold text-[#12B98A] bg-[#EEFBF6] px-2 py-0.5 rounded-md">
                      {data.meals.lunch.requested > 0
                        ? `${Math.round(
                            (data.meals.lunch.collected / data.meals.lunch.requested) * 100
                          )}%`
                        : "0%"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
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

                  {/* Metrics List */}
                  <div className="space-y-2 border-t border-[#F1EFF7] pt-3.5 text-xs">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Booked Portions:</span>
                      <span className="font-bold text-[#1A162B] tabular-nums text-sm">
                        {data.meals.lunch.requested}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Collected:</span>
                      <span className="font-bold text-[#12B98A] tabular-nums text-sm">
                        {data.meals.lunch.collected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Pending:</span>
                      <span className="font-bold text-[#946200] tabular-nums text-sm">
                        {data.meals.lunch.pending}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#35118F] flex items-center justify-center shrink-0">
                        <CookingPot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A162B] text-base">Dinner</h3>
                        <span className="text-xs text-[#6A6577]">Night • 07:30 - 09:30 PM</span>
                      </div>
                    </div>
                    <span className="text-xs tabular-nums font-bold text-[#12B98A] bg-[#EEFBF6] px-2 py-0.5 rounded-md">
                      {data.meals.dinner.requested > 0
                        ? `${Math.round(
                            (data.meals.dinner.collected / data.meals.dinner.requested) * 100
                          )}%`
                        : "0%"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-[#F1EFF7] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#12B98A] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.meals.dinner.requested > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (data.meals.dinner.collected / data.meals.dinner.requested) *
                                      100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metrics List */}
                  <div className="space-y-2 border-t border-[#F1EFF7] pt-3.5 text-xs">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Booked Portions:</span>
                      <span className="font-bold text-[#1A162B] tabular-nums text-sm">
                        {data.meals.dinner.requested}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Collected:</span>
                      <span className="font-bold text-[#12B98A] tabular-nums text-sm">
                        {data.meals.dinner.collected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Pending:</span>
                      <span className="font-bold text-[#946200] tabular-nums text-sm">
                        {data.meals.dinner.pending}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Live Scanner Action Banner */}
          <div className="bg-gradient-to-r from-[#35118F] to-[#250B68] rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5C4F5] block mb-1">
                Instant Verification
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ready to verify staff meal passes?
              </h3>
              <p className="text-xs text-[#D5C4F5] mt-1 max-w-lg leading-relaxed">
                Scan staff QR passes using device camera or barcode gun. Prevents duplicate redemptions automatically.
              </p>
            </div>
            <Link
              href="/canteen/scan"
              className="inline-flex items-center space-x-2 h-11 px-6 bg-[#12B98A] hover:bg-[#0ea278] active:bg-[#0c7a5b] text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 self-start sm:self-auto"
            >
              <ScanLine className="w-4 h-4" />
              <span>Launch QR Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
