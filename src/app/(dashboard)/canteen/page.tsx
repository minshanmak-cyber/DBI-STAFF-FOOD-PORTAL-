"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScanLine,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  RefreshCw,
  UtensilsCrossed,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E2EE]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-[#24212D]">
              Meal Counter Status
            </h1>
            <span className="badge-purple">
              Canteen Service
            </span>
          </div>
          <p className="text-xs text-[#6A6577] mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6A6577]" />
            <span>
              Service Date:{" "}
              <span className="font-semibold text-[#24212D]">
                {data?.serviceDateDisplay || "Today"}
              </span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn-secondary h-10 px-3 text-xs"
            title="Refresh meal counts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#35118F]" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/canteen/scan"
            className="btn-primary h-10 px-4 text-xs font-medium"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open QR Scanner</span>
          </Link>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-6 h-6 animate-spin text-[#35118F] mr-3" />
          <span className="text-sm">Loading canteen counts...</span>
        </div>
      ) : data ? (
        <>
          {/* Daily Aggregate Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Meals Booked"
              value={data.totalRequested}
              icon={<UtensilsCrossed className="w-4 h-4" />}
              subtext="All service windows combined"
            />
            <StatCard
              label="Total Collected"
              value={data.totalCollected}
              icon={<CheckCircle className="w-4 h-4 text-[#12B98A]" />}
              subtext="Successfully verified"
              badge={`${data.totalRequested > 0 ? Math.round((data.totalCollected / data.totalRequested) * 100) : 0}% completed`}
              badgeColor="teal"
            />
            <StatCard
              label="Awaiting Collection"
              value={data.totalPending}
              icon={<Clock className="w-4 h-4 text-[#F5B51B]" />}
              subtext="Pending collection"
              badgeColor="amber"
            />
          </div>

          {/* Service Window Breakdown */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-[#24212D]">
              Meal-by-Meal Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Breakfast */}
              <div className="bg-white border border-[#E5E2EE] rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#24212D] text-base">Breakfast</h3>
                    <span className="text-xs text-[#6A6577]">Morning Service</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#6A6577]">
                    {data.meals.breakfast.requested > 0
                      ? `${Math.round((data.meals.breakfast.collected / data.meals.breakfast.requested) * 100)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="space-y-2 border-t border-[#E5E2EE] pt-3 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Requested:</span>
                    <span className="font-semibold text-[#24212D] font-mono">
                      {data.meals.breakfast.requested}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Collected:</span>
                    <span className="font-semibold text-[#12B98A] font-mono">
                      {data.meals.breakfast.collected}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Pending:</span>
                    <span className="font-semibold text-[#B88204] font-mono">
                      {data.meals.breakfast.pending}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white border border-[#E5E2EE] rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#24212D] text-base">Lunch</h3>
                    <span className="text-xs text-[#6A6577]">Afternoon Service</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#6A6577]">
                    {data.meals.lunch.requested > 0
                      ? `${Math.round((data.meals.lunch.collected / data.meals.lunch.requested) * 100)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="space-y-2 border-t border-[#E5E2EE] pt-3 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Requested:</span>
                    <span className="font-semibold text-[#24212D] font-mono">
                      {data.meals.lunch.requested}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Collected:</span>
                    <span className="font-semibold text-[#12B98A] font-mono">
                      {data.meals.lunch.collected}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Pending:</span>
                    <span className="font-semibold text-[#B88204] font-mono">
                      {data.meals.lunch.pending}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white border border-[#E5E2EE] rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#24212D] text-base">Dinner</h3>
                    <span className="text-xs text-[#6A6577]">Night Service</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#6A6577]">
                    {data.meals.dinner.requested > 0
                      ? `${Math.round((data.meals.dinner.collected / data.meals.dinner.requested) * 100)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="space-y-2 border-t border-[#E5E2EE] pt-3 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Requested:</span>
                    <span className="font-semibold text-[#24212D] font-mono">
                      {data.meals.dinner.requested}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Collected:</span>
                    <span className="font-semibold text-[#12B98A] font-mono">
                      {data.meals.dinner.collected}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#6A6577]">Pending:</span>
                    <span className="font-semibold text-[#B88204] font-mono">
                      {data.meals.dinner.pending}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

