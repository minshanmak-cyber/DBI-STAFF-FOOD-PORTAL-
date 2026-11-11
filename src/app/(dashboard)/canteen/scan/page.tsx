"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Utensils,
  Clock,
  User,
} from "lucide-react";
import QrScannerComponent from "@/components/QrScannerComponent";

interface VerificationResult {
  status:
    | "SUCCESS"
    | "ALREADY_COLLECTED"
    | "INELIGIBLE"
    | "INVALID_TOKEN"
    | "EXPIRED"
    | "STAFF_INACTIVE"
    | "ERROR";
  success: boolean;
  message: string;
  data?: {
    staffId: string;
    staffName: string;
    department?: string | null;
    mealType: string;
    serviceDate: string;
    collectedAt?: string;
    previouslyCollectedAt?: string;
  };
}

export default function CanteenScanPage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (scannedToken: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/canteen/verify-collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: scannedToken }),
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({
        status: "ERROR",
        success: false,
        message: "Failed to communicate with verification server.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <Link
          href="/canteen"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6A6577] hover:text-[#35118F] mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Canteen Dashboard</span>
        </Link>

        <div className="flex items-stretch gap-3 sm:gap-3.5">
          <div className="w-1 bg-[#12B98A] rounded-full self-stretch shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0C7A5B] mb-0.5">
              Live Meal Dispensary
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
              Meal Collection Verification
            </h1>
            <p className="text-xs text-[#6A6577] mt-1 leading-relaxed">
              Scan the staff member's pass QR code. Database locks prevent duplicate meal redemptions.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div
          className={`rounded-2xl p-6 shadow-sm transition-all animate-in fade-in-0 zoom-in-95 duration-200 ${
            result.status === "SUCCESS"
              ? "bg-[#EEFBF6] text-[#0C7A5B]"
              : result.status === "ALREADY_COLLECTED"
              ? "bg-rose-50 text-rose-950"
              : result.status === "INELIGIBLE"
              ? "bg-[#FEF9ED] text-[#946200]"
              : "bg-red-50 text-red-950"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white shadow-xs shrink-0">
              {result.status === "SUCCESS" ? (
                <CheckCircle2 className="w-8 h-8 text-[#12B98A]" />
              ) : result.status === "ALREADY_COLLECTED" ? (
                <XCircle className="w-8 h-8 text-rose-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-[#D97706]" />
              )}
            </div>

            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                {result.status === "SUCCESS"
                  ? "Collection Approved"
                  : result.status === "ALREADY_COLLECTED"
                  ? "Duplicate Collection Denied"
                  : result.status === "INELIGIBLE"
                  ? "Staff Not Eligible"
                  : "Verification Failed"}
              </span>
              <h2 className="text-lg font-bold mt-0.5 leading-snug">{result.message}</h2>

              {result.data && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-xs text-xs text-[#1A162B] space-y-2">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6A6577] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Staff Member:
                    </span>
                    <span className="font-bold text-[#1A162B]">
                      {result.data.staffName} ({result.data.staffId})
                    </span>
                  </div>
                  {result.data.department && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577]">Department:</span>
                      <span className="font-medium text-[#1A162B]">
                        {result.data.department}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6A6577] flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" />
                      Meal Type:
                    </span>
                    <span className="font-extrabold text-[#35118F] font-mono uppercase bg-[#F4F0FD] px-2 py-0.5 rounded-md">
                      {result.data.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6A6577]">Service Date:</span>
                    <span className="font-mono font-medium text-[#1A162B]">
                      {result.data.serviceDate}
                    </span>
                  </div>
                  {result.data.collectedAt && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#12B98A]" />
                        Collected At:
                      </span>
                      <span className="font-mono font-bold text-[#12B98A]">
                        {new Date(result.data.collectedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {result.data.previouslyCollectedAt && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6A6577] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        Previously Collected:
                      </span>
                      <span className="font-mono font-bold text-rose-600">
                        {new Date(result.data.previouslyCollectedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="btn-primary h-10 px-5 rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Next Staff Member</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Component */}
      <QrScannerComponent onScan={handleScan} isProcessing={processing} />
    </div>
  );
}
