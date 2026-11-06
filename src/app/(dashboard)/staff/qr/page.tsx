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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6A6577] hover:text-[#35118F] mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Meal Selection</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#24212D]">Your Meal Collection QR Codes</h1>
          <p className="text-xs text-[#6A6577] mt-1">
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
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E5E2EE] hover:bg-[#F6F5FA] text-[#24212D] rounded-xl shadow-xs transition"
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
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E5E2EE] hover:bg-[#F6F5FA] text-[#24212D] rounded-xl shadow-xs transition"
          >
            Tomorrow
          </button>
          <input
            id="serviceDate"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-[#E5E2EE] rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#35118F] bg-white text-[#24212D]"
          />

          {data?.qrs && data.qrs.length > 1 && (
            <button
              type="button"
              onClick={downloadAllPasses}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#35118F] hover:bg-[#2a0d72] text-white rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Passes</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6A6577]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F] mr-3" />
          <span>Generating and loading QR passes...</span>
        </div>
      ) : data?.qrs.length === 0 ? (
        <div className="bg-white border border-[#E5E2EE] rounded-2xl p-12 text-center">
          <QrCode className="w-12 h-12 text-[#6A6577]/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#24212D]">
            No Active Meal Requests for {data.serviceDateDisplay}
          </h3>
          <p className="text-xs text-[#6A6577] max-w-md mx-auto mt-2">
            You have not requested any meals (or opted out) for this date. Only meals that were requested before the cutoff generate collection QR passes.
          </p>
          <div className="mt-6">
            <Link
              href="/staff"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#35118F] text-white text-xs font-semibold rounded-xl hover:bg-[#2a0d72] transition shadow-xs"
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
              className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col items-center text-center transition ${
                item.isCollected ? "border-[#D2F6EA] bg-[#EEFBF6]/30" : "border-[#E5E2EE]"
              }`}
            >
              {/* Badge */}
              <div className="w-full flex items-center justify-between mb-4">
                <span className="font-bold text-[#24212D] uppercase tracking-wider text-sm">
                  {item.mealType}
                </span>
                {item.isCollected ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#0C7A5B] bg-[#EEFBF6] border border-[#D2F6EA] px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-[#12B98A]" />
                    <span>Collected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#35118F] bg-[#F4F0FD] border border-[#E9E1FA] px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-[#35118F]" />
                    <span>Eligible for Collection</span>
                  </span>
                )}
              </div>

              {/* QR Image */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E2EE] shadow-xs relative">
                <img
                  src={item.dataUrl}
                  alt={`${item.mealType} QR Code`}
                  className={`w-56 h-56 ${item.isCollected ? "opacity-30 grayscale" : ""}`}
                />
                {item.isCollected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 rounded-2xl">
                    <CheckCircle className="w-12 h-12 text-[#12B98A] mb-1" />
                    <span className="text-xs font-bold text-[#0C7A5B] uppercase">
                      Already Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="mt-4 text-xs text-[#6A6577] font-mono break-all max-w-xs">
                Token: {item.token}
              </div>

              {/* Download Button */}
              <div className="mt-4 w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => downloadMealPass(item)}
                  disabled={downloadingMeal === item.mealType}
                  className="w-full max-w-xs inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#35118F] hover:bg-[#2a0d72] active:scale-[0.99] rounded-xl shadow-xs transition disabled:opacity-50"
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
                <div className="mt-3 text-xs text-[#0C7A5B] bg-[#EEFBF6] border border-[#D2F6EA] px-3 py-1.5 rounded-xl">
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

