"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScanLine,
  SunMedium,
  Sunset,
  Moon,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/StatCard";

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

export default function CanteenDashboardPage() {
  const [data, setData] = useState<CanteenStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/canteen/counts");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Action Banner */}
      <div className="bg-[#35118F] text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#35118F]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F5B51B] bg-white/10 border border-[#F5B51B]/30 px-3 py-1 rounded-full">
            Canteen Service Counter
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3 text-white">
            Today's Meal Verification & Collection
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#12B98A]" />
            <span>Service Date: {data?.serviceDateDisplay || "Today"}</span>
          </p>
        </div>

        <div>
          <Link
            href="/canteen/scan"
            className="inline-flex items-center space-x-3 px-6 py-4 bg-[#12B98A] hover:bg-[#0ea278] text-white font-bold rounded-2xl shadow-sm transition transform hover:-translate-y-0.5"
          >
            <ScanLine className="w-6 h-6 text-white" />
            <span className="text-base">Open QR Scanner</span>
          </Link>
        </div>
      </div>

      {/* Real-time Counts */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#24212D]">Today's Meal Counter Status</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6A6577] hover:text-[#35118F] bg-white border border-[#E5E2EE] px-3 py-1.5 rounded-xl transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#35118F]" : ""}`} />
          <span>Refresh Counts</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Loading canteen counts...</span>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-[#FEF9ED] text-[#B88204] rounded-xl border border-[#F5B51B]/30">
                  <SunMedium className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#24212D] text-base">Breakfast</h3>
                  <span className="text-xs text-[#6A6577]">Morning service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-[#E5E2EE] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Requested:</span>
                  <span className="font-bold text-[#24212D] font-mono">
                    {data.meals.breakfast.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Collected:</span>
                  <span className="font-bold text-[#12B98A] font-mono">
                    {data.meals.breakfast.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Pending:</span>
                  <span className="font-bold text-[#B88204] font-mono">
                    {data.meals.breakfast.pending}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-[#EEFBF6] text-[#0C7A5B] rounded-xl border border-[#12B98A]/30">
                  <Sunset className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#24212D] text-base">Lunch</h3>
                  <span className="text-xs text-[#6A6577]">Afternoon service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-[#E5E2EE] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Requested:</span>
                  <span className="font-bold text-[#24212D] font-mono">
                    {data.meals.lunch.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Collected:</span>
                  <span className="font-bold text-[#12B98A] font-mono">
                    {data.meals.lunch.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Pending:</span>
                  <span className="font-bold text-[#B88204] font-mono">
                    {data.meals.lunch.pending}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-[#F4F0FD] text-[#35118F] rounded-xl border border-[#35118F]/20">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#24212D] text-base">Dinner</h3>
                  <span className="text-xs text-[#6A6577]">Night service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-[#E5E2EE] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Requested:</span>
                  <span className="font-bold text-[#24212D] font-mono">
                    {data.meals.dinner.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Collected:</span>
                  <span className="font-bold text-[#12B98A] font-mono">
                    {data.meals.dinner.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6577]">Pending:</span>
                  <span className="font-bold text-[#B88204] font-mono">
                    {data.meals.dinner.pending}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

