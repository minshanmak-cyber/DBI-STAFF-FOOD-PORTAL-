"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Coffee,
  Utensils,
  CookingPot,
  Sparkles,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import FoodLoadingState, { FoodSpinner } from "@/components/FoodLoader";

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

export default function AdminReportsPage() {
  const [data, setData] = useState<CountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceDate, setServiceDate] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const fetchSummary = async (dateParam?: string) => {
    setLoading(true);
    try {
      const url = dateParam ? `/api/admin/counts?serviceDate=${dateParam}` : `/api/admin/counts`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!serviceDate) setServiceDate(json.serviceDate);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDateChange = (newDate: string) => {
    setServiceDate(newDate);
    fetchSummary(newDate);
  };

  const handleDownload = (format: "excel" | "pdf") => {
    setDownloadingFormat(format);
    const url = `/api/admin/reports/export?serviceDate=${serviceDate}&format=${format}`;
    window.location.href = url;
    setTimeout(() => setDownloadingFormat(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-stretch gap-3 sm:gap-3.5">
          <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6A6577] mb-0.5">
              Exports & Audits
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
              Food Production Reports
            </h1>
            <p className="text-xs text-[#6A6577] mt-1">
              Generate and export official kitchen sheets and staff response audits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-[#F6F5FA] px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-[#35118F] shrink-0" />
            <span className="text-xs font-semibold text-[#24212D]">Date:</span>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs text-[#24212D] font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDownload("excel")}
            disabled={loading || Boolean(downloadingFormat)}
            className="inline-flex items-center space-x-2 h-10 px-4 bg-[#12B98A] hover:bg-[#0ea278] active:bg-[#0c7a5b] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            {downloadingFormat === "excel" ? (
              <FoodSpinner className="w-4 h-4 text-white" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={loading || Boolean(downloadingFormat)}
            className="btn-primary h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center space-x-2"
          >
            {downloadingFormat === "pdf" ? (
              <FoodSpinner className="w-4 h-4 text-white" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Export PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <FoodLoadingState
          title="Generating report preview..."
          subtitle="Compiling production numbers and logs"
          showText
        />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <StatCard
              label="Breakfast Prep Target"
              value={data.meals.breakfast.requested}
              subtext={`Verified: ${data.meals.breakfast.collected} | Pending: ${data.meals.breakfast.pending}`}
              icon={<Coffee className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
            <StatCard
              label="Lunch Prep Target"
              value={data.meals.lunch.requested}
              subtext={`Verified: ${data.meals.lunch.collected} | Pending: ${data.meals.lunch.pending}`}
              icon={<Utensils className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
            <StatCard
              label="Dinner Prep Target"
              value={data.meals.dinner.requested}
              subtext={`Verified: ${data.meals.dinner.collected} | Pending: ${data.meals.dinner.pending}`}
              icon={<CookingPot className="w-5 h-5 text-[#35118F]" />}
              badge="Portions"
              badgeColor="purple"
            />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1A162B] mb-1">Export Contents Description</h2>
            <p className="text-xs text-[#6A6577]">Both downloadable formats contain verified operational data</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#6A6577] mt-4">
              <div className="p-4 bg-[#F8F7FC] rounded-xl">
                <span className="font-bold text-[#1A162B] block mb-1">
                  1. Production Counts Summary
                </span>
                Calculated food targets, collections, remaining portions, and staff participation statistics.
              </div>
              <div className="p-4 bg-[#F8F7FC] rounded-xl">
                <span className="font-bold text-[#1A162B] block mb-1">
                  2. Staff Response Audit
                </span>
                Individual staff entries for Breakfast, Lunch, and Dinner with last modification timestamps.
              </div>
              <div className="p-4 bg-[#F8F7FC] rounded-xl">
                <span className="font-bold text-[#1A162B] block mb-1">
                  3. Meal Collection Logs
                </span>
                Canteen operator verification timestamps, staff identities, and redemption records.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
