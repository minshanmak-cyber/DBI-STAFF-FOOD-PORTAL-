"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QrCode, ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2, Download } from "lucide-react";

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

export default function StaffQrPage() {
  const [data, setData] = useState<QrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [downloadingMeal, setDownloadingMeal] = useState<string | null>(null);

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
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Top header banner
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(10, 10, canvas.width - 20, 110);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DBI STAFF FOOD PORTAL", canvas.width / 2, 58);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("OFFICIAL CANTEEN MEAL PASS", canvas.width / 2, 88);

      // Meal pill badge
      const badgeColors: Record<string, { bg: string; text: string }> = {
        BREAKFAST: { bg: "#0284c7", text: "#ffffff" },
        LUNCH: { bg: "#0f766e", text: "#ffffff" },
        DINNER: { bg: "#4338ca", text: "#ffffff" },
      };
      const color = badgeColors[item.mealType] || { bg: "#0f172a", text: "#ffffff" };

      ctx.fillStyle = color.bg;
      const pillW = 230;
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
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(40, 190, canvas.width - 80, 80);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 190, canvas.width - 80, 80);

      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("STAFF ID / NAME", 60, 216);
      ctx.fillText("SERVICE DATE", canvas.width / 2 + 20, 216);

      ctx.fillStyle = "#0f172a";
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
        ctx.fillStyle = "#64748b";
        ctx.font = "12px monospace";
        ctx.fillText(`Token: ${item.token}`, canvas.width / 2, 645);

        // Footer instruction
        ctx.fillStyle = "#0284c7";
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Show this QR pass at the canteen counter for collection", canvas.width / 2, 680);

        ctx.fillStyle = "#94a3b8";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Meal Selection</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Your Meal Collection QR Codes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Present these QR codes at the canteen counter during meal service.
          </p>
        </div>

        {/* Date Selector & Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              handleDateChange(today);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = tomorrow.toISOString().split("T")[0];
              handleDateChange(tomorrowStr);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition"
          >
            Tomorrow
          </button>
          <input
            id="serviceDate"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />

          {data?.qrs && data.qrs.length > 1 && (
            <button
              type="button"
              onClick={downloadAllPasses}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition inline-flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Passes</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
          <span>Generating and loading QR passes...</span>
        </div>
      ) : data?.qrs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No Active Meal Requests for {data.serviceDateDisplay}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            You have not requested any meals (or opted out) for this date. Only meals that were requested before the cutoff generate collection QR passes.
          </p>
          <div className="mt-6">
            <Link
              href="/staff"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
            >
              <span>Manage Next-Day Meal Requests</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.qrs.map((item) => (
            <div
              key={item.mealType}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition ${
                item.isCollected ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
              }`}
            >
              {/* Badge */}
              <div className="w-full flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">
                  {item.mealType}
                </span>
                {item.isCollected ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Collected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Eligible for Collection</span>
                  </span>
                )}
              </div>

              {/* QR Image */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                <img
                  src={item.dataUrl}
                  alt={`${item.mealType} QR Code`}
                  className={`w-56 h-56 ${item.isCollected ? "opacity-40 grayscale" : ""}`}
                />
                {item.isCollected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Already Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="mt-4 text-xs text-slate-500 font-mono break-all max-w-xs">
                Token: {item.token}
              </div>

              {/* Download Button */}
              <div className="mt-4 w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => downloadMealPass(item)}
                  disabled={downloadingMeal === item.mealType}
                  className="w-full max-w-xs inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {downloadingMeal === item.mealType ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download QR Pass</span>
                </button>
              </div>

              {item.isCollected && item.collectedAt && (
                <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  Collected on: {item.collectedAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

