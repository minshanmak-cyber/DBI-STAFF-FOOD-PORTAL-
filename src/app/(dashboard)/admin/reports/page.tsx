"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  SunMedium,
  Sunset,
  Moon,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E2EE] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#24212D]">Food Production Reports & Exports</h1>
          <p className="text-xs text-[#6A6577] mt-1">
            Generate and export official kitchen sheets and staff response audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-[#F6F5FA] p-2 rounded-xl border border-[#E5E2EE]">
            <Calendar className="w-4 h-4 text-[#35118F]" />
            <span className="text-xs font-semibold text-[#24212D]">Date:</span>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-[#E5E2EE] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#35118F] bg-white text-[#24212D]"
            />
          </div>

          <button
            onClick={() => handleDownload("excel")}
            disabled={loading || Boolean(downloadingFormat)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#12B98A] hover:bg-[#0ea278] text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {downloadingFormat === "excel" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={loading || Boolean(downloadingFormat)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {downloadingFormat === "pdf" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileText className="w-4 h-4 text-[#F5B51B]" />
            )}
            <span>Export PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Generating report preview...</span>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Breakfast Prep Target"
              value={data.meals.breakfast.requested}
              subtext={`Verified: ${data.meals.breakfast.collected} | Pending: ${data.meals.breakfast.pending}`}
              icon={<SunMedium className="w-5 h-5 text-[#F5B51B]" />}
            />
            <StatCard
              label="Lunch Prep Target"
              value={data.meals.lunch.requested}
              subtext={`Verified: ${data.meals.lunch.collected} | Pending: ${data.meals.lunch.pending}`}
              icon={<Sunset className="w-5 h-5 text-[#12B98A]" />}
            />
            <StatCard
              label="Dinner Prep Target"
              value={data.meals.dinner.requested}
              subtext={`Verified: ${data.meals.dinner.collected} | Pending: ${data.meals.dinner.pending}`}
              icon={<Moon className="w-5 h-5 text-[#35118F]" />}
            />
          </div>

          <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#24212D] mb-2">Export Contents Description</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#6A6577] mt-4">
              <div className="p-4 bg-[#F6F5FA] rounded-xl border border-[#E5E2EE]">
                <span className="font-bold text-[#24212D] block mb-1">
                  1. Production Counts Summary
                </span>
                Calculated food targets, collections, remaining portions, and staff participation statistics.
              </div>
              <div className="p-4 bg-[#F6F5FA] rounded-xl border border-[#E5E2EE]">
                <span className="font-bold text-[#24212D] block mb-1">
                  2. Staff Response Audit
                </span>
                Individual staff entries for Breakfast, Lunch, and Dinner with last modification timestamps.
              </div>
              <div className="p-4 bg-[#F6F5FA] rounded-xl border border-[#E5E2EE]">
                <span className="font-bold text-[#24212D] block mb-1">
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

