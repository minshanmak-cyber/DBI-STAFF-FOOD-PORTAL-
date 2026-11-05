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
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full">
            Canteen Service Counter
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            Today's Meal Verification & Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Service Date: {data?.serviceDateDisplay || "Today"}</span>
          </p>
        </div>

        <div>
          <Link
            href="/canteen/scan"
            className="inline-flex items-center space-x-3 px-6 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            <ScanLine className="w-6 h-6 text-slate-950" />
            <span className="text-base">Open QR Scanner</span>
          </Link>
        </div>
      </div>

      {/* Real-time Counts */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Today's Meal Counter Status</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Counts</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
          <span>Loading canteen counts...</span>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <SunMedium className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Breakfast</h3>
                  <span className="text-xs text-slate-500">Morning service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {data.meals.breakfast.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collected:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {data.meals.breakfast.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending:</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {data.meals.breakfast.pending}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl">
                  <Sunset className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Lunch</h3>
                  <span className="text-xs text-slate-500">Afternoon service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {data.meals.lunch.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collected:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {data.meals.lunch.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending:</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {data.meals.lunch.pending}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Dinner</h3>
                  <span className="text-xs text-slate-500">Night service</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {data.meals.dinner.requested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collected:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {data.meals.dinner.collected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending:</span>
                  <span className="font-bold text-amber-600 font-mono">
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

