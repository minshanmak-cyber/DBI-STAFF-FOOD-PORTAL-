"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  Calendar,
  Utensils,
  Coffee,
  Info,
} from "lucide-react";
import { formatServiceDateDisplay } from "@/lib/timezone";

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

interface MealQrItem {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  token: string;
  dataUrl: string;
  isCollected: boolean;
  collectedAt: string | null;
  expiresAt: string;
}

interface QrResponse {
  serviceDate: string;
  serviceDateDisplay: string;
  qrs: MealQrItem[];
  totalOptIn: number;
  staffId?: string;
  staffName?: string;
  department?: string | null;
}

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCompactDate = (isoDate: string) => {
  if (!isoDate) return "Select date";
  try {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return isoDate;
  }
};

function getMealConfig(mealType: "BREAKFAST" | "LUNCH" | "DINNER") {
  switch (mealType) {
    case "BREAKFAST":
      return {
        title: "Breakfast",
        subtitle: "Morning service",
        headerBg: "bg-[#FFF9EE] border-[#FDEAC9]",
        iconBg: "bg-[#FDEAC9] text-[#92400E]",
        icon: Coffee,
      };
    case "LUNCH":
      return {
        title: "Lunch",
        subtitle: "Afternoon service",
        headerBg: "bg-[#F8F5FF] border-[#EBE3FA]",
        iconBg: "bg-[#EDE4FA] text-[#35118F]",
        icon: Utensils,
      };
    case "DINNER":
      return {
        title: "Dinner",
        subtitle: "Night service",
        headerBg: "bg-[#F0F7FD] border-[#DCEBF9]",
        iconBg: "bg-[#DCEBF9] text-[#0284C7]",
        icon: ClocheIcon,
      };
  }
}

export default function StaffQrPage() {
  const [data, setData] = useState<QrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [downloadingMeal, setDownloadingMeal] = useState<string | null>(null);

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  const fetchQrs = async (dateParam?: string) => {
    setLoading(true);
    try {
      const url = dateParam ? `/api/staff/qr?serviceDate=${dateParam}` : `/api/staff/qr`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!selectedDate) setSelectedDate(json.serviceDate);
      }
    } catch (e) {
      console.error("Error fetching QR codes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchQrs(newDate);
  };

  // Download full branded pass with details
  const downloadMealPass = (item: MealQrItem) => {
    setDownloadingMeal(item.mealType);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setDownloadingMeal(null);
        return;
      }

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border
      ctx.strokeStyle = "#E5E2EE";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Top header banner in DBI Deep Purple
      ctx.fillStyle = "#35118F";
      ctx.fillRect(10, 10, canvas.width - 20, 110);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DIGITAL BRIDGE INTERNATIONAL", canvas.width / 2, 58);

      ctx.fillStyle = "#F5B51B";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("STAFF FOOD MANAGEMENT PORTAL • MEAL PASS", canvas.width / 2, 88);

      // Meal pill badge
      const badgeColors: Record<string, { bg: string; text: string }> = {
        BREAKFAST: { bg: "#F5B51B", text: "#24212D" },
        LUNCH: { bg: "#12B98A", text: "#ffffff" },
        DINNER: { bg: "#35118F", text: "#ffffff" },
      };
      const color = badgeColors[item.mealType] || { bg: "#35118F", text: "#ffffff" };

      ctx.fillStyle = color.bg;
      const pillW = 240;
      const pillH = 38;
      const pillX = (canvas.width - pillW) / 2;
      const pillY = 135;
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 19);
        ctx.fill();
      } else {
        ctx.fillRect(pillX, pillY, pillW, pillH);
      }

      ctx.fillStyle = color.text;
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${item.mealType} COLLECTION PASS`, canvas.width / 2, pillY + 24);

      // Staff & Date details box
      ctx.fillStyle = "#F6F5FA";
      ctx.fillRect(40, 190, canvas.width - 80, 80);
      ctx.strokeStyle = "#E5E2EE";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 190, canvas.width - 80, 80);

      ctx.textAlign = "left";
      ctx.fillStyle = "#6A6577";
      ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("STAFF ID / NAME", 60, 216);
      ctx.fillText("SERVICE DATE", canvas.width / 2 + 20, 216);

      ctx.fillStyle = "#24212D";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const staffLabel = data?.staffName ? `${data.staffId || ""} • ${data.staffName}` : (data?.staffId || "Staff Member");
      ctx.fillText(staffLabel, 60, 246);
      ctx.fillText(data?.serviceDateDisplay || data?.serviceDate || "", canvas.width / 2 + 20, 246);

      // QR Image
      const img = new window.Image();
      img.onload = () => {
        const qrSize = 330;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 285;
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Token
        ctx.textAlign = "center";
        ctx.fillStyle = "#6A6577";
        ctx.font = "12px monospace";
        ctx.fillText(`Token: ${item.token}`, canvas.width / 2, 645);

        // Footer instruction
        ctx.fillStyle = "#35118F";
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Present this QR pass at the canteen counter for collection", canvas.width / 2, 680);

        ctx.fillStyle = "#6A6577";
        ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Valid strictly for single meal redemption", canvas.width / 2, 705);

        // Trigger download
        const link = document.createElement("a");
        link.download = `DBI_${item.mealType}_${data?.serviceDate || "QR"}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingMeal(null);
      };
      img.onerror = () => {
        setDownloadingMeal(null);
      };
      img.src = item.dataUrl;
    } catch (err) {
      console.error("Failed to render meal pass:", err);
      setDownloadingMeal(null);
    }
  };

  // Download all passes in one click
  const downloadAllPasses = async () => {
    if (!data?.qrs || data.qrs.length === 0) return;
    for (let i = 0; i < data.qrs.length; i++) {
      downloadMealPass(data.qrs[i]);
      if (i < data.qrs.length - 1) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#6A6577] hover:text-[#35118F] mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Meal Selection</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight">
            Your Meal Collection QR Codes
          </h1>
          <p className="text-xs sm:text-sm text-[#555062] mt-1">
            Present these QR codes at the canteen counter during meal service.
          </p>
        </div>

        {/* Date Selector & Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleDateChange(todayStr)}
            className={`h-9 sm:h-10 px-4 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              selectedDate === todayStr
                ? "bg-[#35118F] text-white shadow-xs"
                : "bg-white hover:bg-[#F6F5FA] text-[#1A162B] border border-[#E5E2EE]"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleDateChange(tomorrowStr)}
            className={`h-9 sm:h-10 px-4 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              selectedDate === tomorrowStr
                ? "bg-[#35118F] text-white shadow-xs"
                : "bg-white hover:bg-[#F6F5FA] text-[#1A162B] border border-[#E5E2EE]"
            }`}
          >
            Tomorrow
          </button>

          {/* Calendar Picker pill with calendar icon on the left */}
          <div className="relative inline-flex items-center">
            <div className="h-9 sm:h-10 px-3.5 text-xs sm:text-sm font-medium border border-[#E5E2EE] rounded-xl bg-white text-[#1A162B] flex items-center gap-2 shadow-2xs hover:border-[#D5C4F5] transition-colors cursor-pointer">
              <Calendar className="w-4 h-4 text-[#555062]" />
              <span>{formatCompactDate(selectedDate)}</span>
            </div>
            <input
              id="serviceDate"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Select service date"
            />
          </div>

          {/* Download All Passes Button */}
          {data?.qrs && data.qrs.length > 0 && (
            <button
              type="button"
              onClick={downloadAllPasses}
              className="h-9 sm:h-10 px-4 text-xs sm:text-sm font-medium border border-[#35118F] text-[#35118F] bg-white hover:bg-[#F6F5FA] rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#35118F]" />
              <span>Download All</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E2EE] rounded-2xl p-16 text-center shadow-xs flex flex-col items-center justify-center text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mb-3" />
          <span className="text-sm font-medium">Generating and loading QR passes...</span>
        </div>
      ) : data?.qrs.length === 0 ? (
        /* Empty State Card matching reference mockup with balanced compact vertical height */
        <div className="bg-white border border-[#E5E2EE] rounded-2xl p-6 sm:px-8 sm:py-7 shadow-xs flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Left: High-Clarity 3D Layered QR Illustration Asset */}
          <div className="shrink-0 flex items-center justify-center p-1 sm:p-2">
            <Image
              src="/qr-illustration.png?v=3"
              alt="Meal Collection QR Codes"
              width={260}
              height={288}
              className="w-40 sm:w-48 md:w-52 h-auto object-contain select-none mix-blend-multiply"
              priority
              unoptimized
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px self-stretch bg-[#E5E2EE]" />

          {/* Right: Info and Action Buttons */}
          <div className="flex-1 flex flex-col items-start text-left">
            <div className="w-8 h-8 rounded-lg bg-[#F4F0FD] flex items-center justify-center text-[#35118F] mb-2.5">
              <Utensils className="w-4 h-4 text-[#35118F]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A162B] tracking-tight leading-snug">
              No Active Meal Requests for<br />
              <span className="text-[#1A162B]">
                {data?.serviceDateDisplay || formatServiceDateDisplay(selectedDate)}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#555062] mt-2 leading-relaxed max-w-xl">
              You have not requested any meals (or opted out) for this date. Only meals requested before the cutoff will generate collection QR passes.
            </p>
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/staff"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-5 rounded-xl bg-[#35118F] hover:bg-[#280c70] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors"
              >
                <span className="text-base font-semibold mr-1.5 leading-none">+</span>
                <span>Manage Next-Day Meal Requests</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Active QR passes 3-card grid matching reference mockup */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.qrs.map((item) => {
            const config = getMealConfig(item.mealType);
            const IconComp = config.icon;
            return (
              <div
                key={item.mealType}
                className="bg-white border border-[#E5E2EE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Tinted Meal Header Box */}
                  <div
                    className={`${config.headerBg} border rounded-xl p-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A162B] text-sm sm:text-base leading-tight">
                          {config.title}
                        </h3>
                        <span className="text-xs text-[#6A6577] leading-tight">
                          {config.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Eligible / Collected Badge */}
                    {item.isCollected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F6F5FA] text-[#6A6577]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6A6577]" />
                        <span>Collected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEFBF6] text-[#0C7A5B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12B98A]" />
                        <span>Eligible</span>
                      </span>
                    )}
                  </div>

                  {/* Target Service Date Line */}
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#4A4557] my-4">
                    <Calendar className="w-4 h-4 text-[#6A6577]" />
                    <span>
                      {data.serviceDateDisplay || formatServiceDateDisplay(data.serviceDate)}
                    </span>
                  </div>

                  {/* QR Image Container */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#F0EFF5] shadow-xs relative flex items-center justify-center my-1">
                    <img
                      src={item.dataUrl}
                      alt={`${item.mealType} QR Code`}
                      className={`w-52 h-52 sm:w-56 sm:h-56 object-contain ${
                        item.isCollected ? "opacity-25 grayscale" : ""
                      }`}
                    />
                    {item.isCollected && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl">
                        <CheckCircle className="w-10 h-10 text-[#12B98A] mb-1" />
                        <span className="text-xs font-semibold text-[#0C7A5B] uppercase tracking-wider">
                          Already Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div>
                  <button
                    type="button"
                    onClick={() => downloadMealPass(item)}
                    disabled={downloadingMeal === item.mealType}
                    className="w-full h-11 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-xs bg-[#35118F] hover:bg-[#280c70] text-white transition-colors mt-4"
                  >
                    {downloadingMeal === item.mealType ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download QR Pass</span>
                  </button>

                  {item.isCollected && item.collectedAt && (
                    <div className="mt-2.5 text-xs text-[#0C7A5B] text-center font-medium">
                      Collected on: {item.collectedAt}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works banner */}
      <div className="bg-[#F5F2FD] border border-[#E8E1F8] rounded-xl sm:rounded-2xl p-3 sm:px-5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center shrink-0 text-[#35118F] font-semibold">
          <Info className="w-4 h-4 mr-2 text-[#35118F]" />
          <span>How it works</span>
          <span className="hidden md:inline mx-3 text-[#D4C8F5]">|</span>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm text-[#4A4557]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EAE2F8] text-[#35118F] font-bold text-[11px] flex items-center justify-center shrink-0">
              1
            </span>
            <span>Request your meals for the next day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EAE2F8] text-[#35118F] font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </span>
            <span>Get collection QR codes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#EAE2F8] text-[#35118F] font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </span>
            <span>Show the QR code at the canteen counter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
