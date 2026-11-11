"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  FileSpreadsheet,
  Calendar,
  ArrowRight,
  Coffee,
  Utensils,
  CookingPot,
} from "lucide-react";
import StatCard from "@/components/StatCard";
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<CountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchCounts(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A162B] tracking-tight">
            DBI Food Production Counts
          </h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Real-time aggregate food counts and staff participation for{" "}
            <span className="font-semibold text-[#35118F]">
              {data?.serviceDateDisplay || "selected date"}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F6F5FA] px-3 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-[#35118F] shrink-0" />
          <span className="text-xs font-semibold text-[#24212D]">Target Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-xs text-[#24212D] font-medium focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <FoodLoadingState
          title="Calculating live food totals..."
          showText
        />
      ) : data ? (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Breakfast Count"
              value={data.meals.breakfast.requested}
              subtext={`Collected: ${data.meals.breakfast.collected} | Pending: ${data.meals.breakfast.pending}`}
              icon={<Coffee className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
            <StatCard
              label="Lunch Count"
              value={data.meals.lunch.requested}
              subtext={`Collected: ${data.meals.lunch.collected} | Pending: ${data.meals.lunch.pending}`}
              icon={<Utensils className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
            <StatCard
              label="Dinner Count"
              value={data.meals.dinner.requested}
              subtext={`Collected: ${data.meals.dinner.collected} | Pending: ${data.meals.dinner.pending}`}
              icon={<CookingPot className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
            <StatCard
              label="Staff Participation"
              value={`${data.respondedCount} / ${data.totalActiveStaff}`}
              subtext={`Unresponded: ${data.noResponseCount} (treated as Out)`}
              icon={<Users className="w-5 h-5 text-[#12B98A]" />}
              badge={`${Math.round(
                (data.respondedCount / (data.totalActiveStaff || 1)) * 100
              )}%`}
              badgeColor="teal"
            />
          </div>

          {/* Meal Details Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-[#F1EFF7] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#1A162B] text-base">Meal Breakdown Summary</h2>
                <p className="text-xs text-[#6A6577]">
                  Kitchen production targets for {data.serviceDateDisplay}
                </p>
              </div>
              <Link
                href={`/admin/reports?serviceDate=${data.serviceDate}`}
                className="text-xs font-semibold text-[#35118F] hover:text-[#2a0d72] inline-flex items-center space-x-1"
              >
                <span>Export Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6A6577] border-b border-[#F1EFF7]">
                  <tr>
                    <th className="px-5 sm:px-6 py-3.5">Meal Type</th>
                    <th className="px-5 sm:px-6 py-3.5">Opt-In (Prepare)</th>
                    <th className="px-5 sm:px-6 py-3.5">Opt-Out</th>
                    <th className="px-5 sm:px-6 py-3.5">Collected</th>
                    <th className="px-5 sm:px-6 py-3.5">Pending</th>
                    <th className="px-5 sm:px-6 py-3.5 text-right">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EFF7]">
                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-3.5 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-2.5">
                        <Coffee className="w-4 h-4 text-[#35118F]" />
                        <span>Breakfast</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 font-bold text-[#1A162B] tabular-nums text-base">
                      {data.meals.breakfast.requested}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#6A6577] tabular-nums font-medium">
                      {data.meals.breakfast.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#0C7A5B] tabular-nums font-semibold">
                      {data.meals.breakfast.collected}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#946200] tabular-nums font-semibold">
                      {data.meals.breakfast.pending}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs font-bold text-[#1A162B] text-right tabular-nums">
                      {data.meals.breakfast.requested > 0
                        ? `${Math.round(
                            (data.meals.breakfast.collected /
                              data.meals.breakfast.requested) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-3.5 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-2.5">
                        <Utensils className="w-4 h-4 text-[#35118F]" />
                        <span>Lunch</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 font-bold text-[#1A162B] tabular-nums text-base">
                      {data.meals.lunch.requested}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#6A6577] tabular-nums font-medium">
                      {data.meals.lunch.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#0C7A5B] tabular-nums font-semibold">
                      {data.meals.lunch.collected}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#946200] tabular-nums font-semibold">
                      {data.meals.lunch.pending}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs font-bold text-[#1A162B] text-right tabular-nums">
                      {data.meals.lunch.requested > 0
                        ? `${Math.round(
                            (data.meals.lunch.collected /
                              data.meals.lunch.requested) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F9F8FD] transition-colors">
                    <td className="px-5 sm:px-6 py-3.5 font-medium text-[#1A162B]">
                      <div className="flex items-center space-x-2.5">
                        <CookingPot className="w-4 h-4 text-[#35118F]" />
                        <span>Dinner</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 font-bold text-[#1A162B] tabular-nums text-base">
                      {data.meals.dinner.requested}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#6A6577] tabular-nums font-medium">
                      {data.meals.dinner.optOut}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#0C7A5B] tabular-nums font-semibold">
                      {data.meals.dinner.collected}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-[#946200] tabular-nums font-semibold">
                      {data.meals.dinner.pending}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-xs font-bold text-[#1A162B] text-right tabular-nums">
                      {data.meals.dinner.requested > 0
                        ? `${Math.round(
                            (data.meals.dinner.collected /
                              data.meals.dinner.requested) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Administrative Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/staff"
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#F4F0FD] text-[#35118F] rounded-xl shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A162B] text-sm">Staff Management</h3>
                <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
                  Create accounts, assign IDs, reset passwords, and toggle active status.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/responses"
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#EEFBF6] text-[#12B98A] rounded-xl shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A162B] text-sm">Response Corrections</h3>
                <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
                  Review staff choices and apply emergency late corrections with audit compliance.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#FEF9ED] text-[#946200] rounded-xl shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A162B] text-sm">Reports & Exports</h3>
                <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
                  Download production sheets in formatted Excel (.xlsx) and printable PDF formats.
                </p>
              </div>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
