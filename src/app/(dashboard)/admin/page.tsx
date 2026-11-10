"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Users,
  ClipboardList,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  Loader2,
  ArrowRight,
  Coffee,
  Utensils,
  CookingPot,
} from "lucide-react";
import StatCard from "@/components/StatCard";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#E5E2EE] shadow-xs">
        <div>
          <span className="badge-purple">
            Operations Dashboard
          </span>
          <h1 className="text-2xl font-semibold text-[#24212D] mt-2 tracking-tight">DBI Food Production Counts</h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Real-time aggregate food counts and staff participation for{" "}
            <span className="font-medium text-[#24212D]">
              {data?.serviceDateDisplay || "selected date"}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5 bg-[#F6F5FA] p-2 rounded-lg border border-[#E5E2EE]">
          <Calendar className="w-4 h-4 text-[#35118F] shrink-0" />
          <span className="text-xs font-medium text-[#24212D]">Target Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-8 px-2.5 text-xs border border-[#E5E2EE] rounded-md bg-white text-[#24212D] focus:border-[#35118F] focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Calculating live food totals...</span>
        </div>
      ) : data ? (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Breakfast Count"
              value={data.meals.breakfast.requested}
              subtext={`Collected: ${data.meals.breakfast.collected} | Pending: ${data.meals.breakfast.pending}`}
              icon={<Coffee className="w-5 h-5 text-[#35118F]" />}
              badge="Next Day"
              badgeColor="purple"
            />
            <StatCard
              label="Lunch Count"
              value={data.meals.lunch.requested}
              subtext={`Collected: ${data.meals.lunch.collected} | Pending: ${data.meals.lunch.pending}`}
              icon={<Utensils className="w-5 h-5 text-[#35118F]" />}
              badge="Next Day"
              badgeColor="purple"
            />
            <StatCard
              label="Dinner Count"
              value={data.meals.dinner.requested}
              subtext={`Collected: ${data.meals.dinner.collected} | Pending: ${data.meals.dinner.pending}`}
              icon={<CookingPot className="w-5 h-5 text-[#35118F]" />}
              badge="Next Day"
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
          <div className="bg-white border border-[#E5E2EE] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#E5E2EE] flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#24212D] text-sm sm:text-base">Meal Breakdown Summary</h2>
                <p className="text-xs text-[#6A6577]">
                  Kitchen production targets for {data.serviceDateDisplay}
                </p>
              </div>
              <Link
                href={`/admin/reports?serviceDate=${data.serviceDate}`}
                className="text-xs font-medium text-[#35118F] hover:text-[#2a0d72] inline-flex items-center space-x-1"
              >
                <span>Export Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F7FC] text-xs font-medium uppercase tracking-wider text-[#6A6577] border-b border-[#E5E2EE]">
                  <tr>
                    <th className="px-5 py-3">Meal Type</th>
                    <th className="px-5 py-3">Opt-In (Prepare)</th>
                    <th className="px-5 py-3">Opt-Out</th>
                    <th className="px-5 py-3">Collected</th>
                    <th className="px-5 py-3">Pending</th>
                    <th className="px-5 py-3 text-right">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2EE]">
                  <tr className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      <div className="flex items-center space-x-2">
                        <Coffee className="w-4 h-4 text-[#35118F]" />
                        <span>Breakfast</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#24212D] tabular-nums text-base">
                      {data.meals.breakfast.requested}
                    </td>
                    <td className="px-5 py-3.5 text-[#6A6577] tabular-nums">
                      {data.meals.breakfast.optOut}
                    </td>
                    <td className="px-5 py-3.5 text-[#0C7A5B] tabular-nums font-medium">
                      {data.meals.breakfast.collected}
                    </td>
                    <td className="px-5 py-3.5 text-[#946200] tabular-nums font-medium">
                      {data.meals.breakfast.pending}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#24212D] text-right tabular-nums">
                      {data.meals.breakfast.requested > 0
                        ? `${Math.round(
                            (data.meals.breakfast.collected /
                              data.meals.breakfast.requested) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4 text-[#35118F]" />
                        <span>Lunch</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#24212D] tabular-nums text-base">
                      {data.meals.lunch.requested}
                    </td>
                    <td className="px-5 py-3.5 text-[#6A6577] tabular-nums">
                      {data.meals.lunch.optOut}
                    </td>
                    <td className="px-5 py-3.5 text-[#0C7A5B] tabular-nums font-medium">
                      {data.meals.lunch.collected}
                    </td>
                    <td className="px-5 py-3.5 text-[#946200] tabular-nums font-medium">
                      {data.meals.lunch.pending}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#24212D] text-right tabular-nums">
                      {data.meals.lunch.requested > 0
                        ? `${Math.round(
                            (data.meals.lunch.collected /
                              data.meals.lunch.requested) *
                              100
                          )}%`
                        : "0%"}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      <div className="flex items-center space-x-2">
                        <CookingPot className="w-4 h-4 text-[#35118F]" />
                        <span>Dinner</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#24212D] tabular-nums text-base">
                      {data.meals.dinner.requested}
                    </td>
                    <td className="px-5 py-3.5 text-[#6A6577] tabular-nums">
                      {data.meals.dinner.optOut}
                    </td>
                    <td className="px-5 py-3.5 text-[#0C7A5B] tabular-nums font-medium">
                      {data.meals.dinner.collected}
                    </td>
                    <td className="px-5 py-3.5 text-[#946200] tabular-nums font-medium">
                      {data.meals.dinner.pending}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#24212D] text-right tabular-nums">
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
              className="bg-white border border-[#E5E2EE] hover:border-[#D5C4F5] rounded-xl p-5 shadow-xs transition-colors flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#F4F0FD] text-[#35118F] rounded-lg shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#24212D] text-sm">Staff Management</h3>
                <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
                  Create accounts, assign IDs, reset passwords, and toggle active status.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/responses"
              className="bg-white border border-[#E5E2EE] hover:border-[#D2F6EA] rounded-xl p-5 shadow-xs transition-colors flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#EEFBF6] text-[#12B98A] rounded-lg shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#24212D] text-sm">Response Corrections</h3>
                <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
                  Review staff choices and apply emergency late corrections with audit compliance.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="bg-white border border-[#E5E2EE] hover:border-[#FDEFCD] rounded-xl p-5 shadow-xs transition-colors flex items-start space-x-3.5"
            >
              <div className="p-2.5 bg-[#FEF9ED] text-[#946200] rounded-lg shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#24212D] text-sm">Reports & Exports</h3>
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

