"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Loader2,
  QrCode,
  RefreshCw,
  Search,
  Utensils,
  X,
  XCircle,
  Check,
  Sparkles,
} from "lucide-react";
import FoodLoadingState, { FoodSpinner } from "@/components/FoodLoader";

function ClocheIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 7a2 2 0 1 1 4 0" />
      <path d="M4 17a8 8 0 0 1 16 0" />
      <line x1="2" y1="18" x2="22" y2="18" />
    </svg>
  );
}

interface HistoryItem {
  id: string;
  serviceDate: string;
  serviceDateDisplay: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | string;
  status: "OPT_IN" | "OPT_OUT" | "NO_RESPONSE";
  collected: boolean;
  collectedAt: string | null;
  updatedAt: string;
}

type MealFilter = "ALL" | "BREAKFAST" | "LUNCH" | "DINNER";
type StatusFilter = "ALL" | "COLLECTED" | "PENDING" | "OPT_OUT";

export default function StaffHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mealFilter, setMealFilter] = useState<MealFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const fetchHistory = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/staff/history");
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to load meal history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filtered Items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Meal type filter
      if (mealFilter !== "ALL" && item.mealType !== mealFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "COLLECTED" && !item.collected) {
        return false;
      }
      if (statusFilter === "PENDING" && (item.status !== "OPT_IN" || item.collected)) {
        return false;
      }
      if (statusFilter === "OPT_OUT" && item.status !== "OPT_OUT") {
        return false;
      }

      // Search query (matches date display or serviceDate or meal type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = item.serviceDateDisplay.toLowerCase().includes(q);
        const matchesIso = item.serviceDate.includes(q);
        const matchesMeal = item.mealType.toLowerCase().includes(q);
        return matchesDate || matchesIso || matchesMeal;
      }

      return true;
    });
  }, [history, mealFilter, statusFilter, searchQuery]);

  const hasActiveFilters = mealFilter !== "ALL" || statusFilter !== "ALL" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setMealFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  const getMealMeta = (mealType: string) => {
    switch (mealType) {
      case "BREAKFAST":
        return {
          label: "Breakfast",
          subtitle: "Morning Service",
          icon: Coffee,
          color: "text-[#B45309]",
          bg: "bg-[#FEF6E9]",
          border: "border-[#FDE68A]",
        };
      case "LUNCH":
        return {
          label: "Lunch",
          subtitle: "Afternoon Service",
          icon: Utensils,
          color: "text-[#35118F]",
          bg: "bg-[#F4F0FD]",
          border: "border-[#E5DBFB]",
        };
      case "DINNER":
        return {
          label: "Dinner",
          subtitle: "Night Service",
          icon: ClocheIcon,
          color: "text-[#1D4ED8]",
          bg: "bg-[#EFF6FF]",
          border: "border-[#BFDBFE]",
        };
      default:
        return {
          label: mealType,
          subtitle: "Meal Service",
          icon: Utensils,
          color: "text-[#6A6577]",
          bg: "bg-[#F6F5FA]",
          border: "border-[#E5E2EE]",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl w-full mx-auto pb-6">
      {/* ========================================================================= */}
      {/* 1. Header & Navigation                                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6A6577] hover:text-[#35118F] mb-2 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Meal Selection</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight">
            Personal Meal History
          </h1>
          <p className="text-xs sm:text-sm text-[#6A6577] mt-1">
            Review your past meal requests, opt-outs, and verified canteen collection records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchHistory(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-[#4A4557] border border-[#E5E2EE] rounded-lg shadow-2xs hover:bg-[#F6F5FA] hover:text-[#1A162B] transition-colors disabled:opacity-60 cursor-pointer"
            title="Refresh history logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#35118F]" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <Link
            href="/staff/qr"
            className="btn-primary h-9 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR Passes</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Filters & Search Control Bar                                              */}
      {/* ========================================================================= */}
      {!loading && history.length > 0 && (
        <div className="bg-white border border-[#E5E2EE] rounded-xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Meal Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "ALL", label: "All Meals" },
                { id: "BREAKFAST", label: "Breakfast", icon: Coffee },
                { id: "LUNCH", label: "Lunch", icon: Utensils },
                { id: "DINNER", label: "Dinner", icon: ClocheIcon },
              ] as const
            ).map((tab) => {
              const Icon = "icon" in tab ? tab.icon : null;
              const isActive = mealFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMealFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "bg-[#F6F5FA] text-[#6A6577] hover:bg-[#EAE7F2] hover:text-[#1A162B]"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Status Filter & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-xs font-medium text-[#4A4557] bg-[#F6F5FA] border border-[#E5E2EE] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#35118F] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="COLLECTED">Verified Collected</option>
              <option value="PENDING">Pending Collection</option>
              <option value="OPT_OUT">Opted Out</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#6A6577] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F6F5FA] border border-[#E5E2EE] rounded-lg placeholder-[#8A8596] text-[#1A162B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#35118F] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8596] hover:text-[#1A162B]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Clear filters pill */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#B45309] bg-[#FEF6E9] hover:bg-[#FDE68A] transition-colors shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Main Content: Loading / Empty / Data Views                             */}
      {/* ========================================================================= */}
      {loading ? (
        <FoodLoadingState
          title="Loading Meal Records"
          subtitle="Retrieving your verified meal logs and collection history from the server..."
        />
      ) : history.length === 0 ? (
        /* Empty State: Zero history records */
        <div className="bg-white border border-[#E5E2EE] rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F4F0FD] flex items-center justify-center text-[#35118F] mx-auto mb-4">
            <Calendar className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-[#1A162B]">No Historical Records Yet</h3>
          <p className="text-xs sm:text-sm text-[#6A6577] mt-1.5 max-w-md mx-auto leading-relaxed">
            You haven't submitted any next-day meal preferences yet. Once you request or opt out of meals, your verified records will appear here.
          </p>
          <div className="mt-6">
            <Link href="/staff" className="btn-primary h-10 px-5 text-xs font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Go to Meal Selection</span>
            </Link>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty State: Filters returned no matches */
        <div className="bg-white border border-[#E5E2EE] rounded-xl p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#FEF6E9] flex items-center justify-center text-[#B45309] mx-auto mb-3">
            <Search className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-[#1A162B]">No Matching Meal Records</h3>
          <p className="text-xs text-[#6A6577] mt-1 max-w-sm mx-auto">
            We couldn't find any meal history records matching your current filter criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-[#35118F] text-white rounded-lg hover:bg-[#2A0D73] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result count bar */}
          <div className="flex items-center justify-between text-xs text-[#6A6577] px-1">
            <span>
              Showing <strong className="font-semibold text-[#1A162B]">{filteredHistory.length}</strong> of{" "}
              {history.length} records
            </span>
            {hasActiveFilters && (
              <span className="text-[#35118F] font-medium">Filtered view active</span>
            )}
          </div>

          {/* ===================================================================== */}
          {/* Desktop Table View (>= md screens)                                    */}
          {/* ===================================================================== */}
          <div className="hidden md:block bg-white border border-[#E5E2EE] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9FD] border-b border-[#E5E2EE] text-[11px] font-semibold uppercase tracking-wider text-[#6A6577]">
                  <tr>
                    <th className="px-5 py-3.5">Service Date</th>
                    <th className="px-5 py-3.5">Meal Service</th>
                    <th className="px-5 py-3.5">Preference</th>
                    <th className="px-5 py-3.5">Canteen Collection</th>
                    <th className="px-5 py-3.5 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2EE]">
                  {filteredHistory.map((row) => {
                    const meta = getMealMeta(row.mealType);
                    const MealIcon = meta.icon;

                    return (
                      <tr key={row.id} className="hover:bg-[#F9F8FC] transition-colors">
                        {/* Service Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#35118F] shrink-0" />
                            <span className="font-semibold text-[#1A162B]">
                              {row.serviceDateDisplay}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8A8596] font-mono mt-0.5 pl-5.5">
                            {row.serviceDate}
                          </div>
                        </td>

                        {/* Meal Type */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                              <MealIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-[#1A162B] text-xs">
                                {meta.label}
                              </div>
                              <div className="text-[11px] text-[#6A6577]">
                                {meta.subtitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Preference */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {row.status === "OPT_IN" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#E8F8F3] text-[#0C7A5B] border border-[#B3ECD9]">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Requested</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8A8596]" />
                              <span>Opted Out</span>
                            </span>
                          )}
                        </td>

                        {/* Canteen Collection Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {row.collected ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#E8F8F3] text-[#0C7A5B] border border-[#B3ECD9]">
                                <CheckCircle className="w-3.5 h-3.5 text-[#0C7A5B]" />
                                <span>Verified Collected</span>
                              </span>
                              {row.collectedAt && (
                                <div className="text-[11px] text-[#6A6577] mt-1 font-mono flex items-center gap-1">
                                  <span>{row.collectedAt}</span>
                                </div>
                              )}
                            </div>
                          ) : row.status === "OPT_IN" ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F4F0FD] text-[#35118F] border border-[#E5DBFB]">
                                <Clock className="w-3.5 h-3.5 text-[#35118F]" />
                                <span>Pending Collection</span>
                              </span>
                              <div className="text-[11px] text-[#8A8596] mt-0.5">
                                Ready at canteen counter
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#8A8596]">—</span>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="px-5 py-4 whitespace-nowrap text-right text-xs text-[#6A6577] font-mono">
                          {row.updatedAt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* Mobile Card View (< md screens)                                       */}
          {/* ===================================================================== */}
          <div className="md:hidden space-y-3">
            {filteredHistory.map((row) => {
              const meta = getMealMeta(row.mealType);
              const MealIcon = meta.icon;

              return (
                <div
                  key={row.id}
                  className="bg-white border border-[#E5E2EE] rounded-xl p-4 shadow-2xs space-y-3"
                >
                  {/* Top line: Date + Meal Pill */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#F0EDF7] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#35118F] shrink-0" />
                      <span className="font-semibold text-xs text-[#1A162B]">
                        {row.serviceDateDisplay}
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${meta.bg} ${meta.color} border ${meta.border}`}>
                      <MealIcon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </div>
                  </div>

                  {/* Badges line: Preference & Collection */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[#8A8596] mb-1">
                        Preference
                      </div>
                      {row.status === "OPT_IN" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#E8F8F3] text-[#0C7A5B] border border-[#B3ECD9]">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Requested</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#F6F5FA] text-[#6A6577] border border-[#E5E2EE]">
                          <span>Opted Out</span>
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-[#8A8596] mb-1">
                        Collection
                      </div>
                      {row.collected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#E8F8F3] text-[#0C7A5B] border border-[#B3ECD9]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Collected</span>
                        </span>
                      ) : row.status === "OPT_IN" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#F4F0FD] text-[#35118F] border border-[#E5DBFB]">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#8A8596]">—</span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp footer */}
                  {row.collected && row.collectedAt && (
                    <div className="pt-2 border-t border-[#F0EDF7] text-[11px] text-[#0C7A5B] font-mono flex items-center justify-between">
                      <span className="text-[#8A8596] font-sans">Collected At:</span>
                      <span>{row.collectedAt}</span>
                    </div>
                  )}

                  <div className="pt-1.5 text-[10px] text-[#8A8596] font-mono flex items-center justify-between">
                    <span className="font-sans">Last Updated:</span>
                    <span>{row.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
